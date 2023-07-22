import 'dotenv/config'
import {Mutex} from 'async-mutex'
import Jimp from 'jimp'
import {loadDb, persistDb, makeStorageClient} from './service/core/ipfs/index.js'
import createDb from './service/core/lowdb/index.js'
import createHeartBeat from './service/core/heartbeats/index.js'
import {checkWhenNewGuild, checkWhenReady, onMessageCreate, createClient} from './service/discord/index.js'
import processCommand from './service/discord/command/index.js'
import {checkEndRound} from './service/core/reputation/index.js'
import {processReaction} from './service/discord/reaction/index.js'
import {checkEndProposal} from './service/discord/proposal/index.js'
import logger from './service/core/winston/index.js';
import {checkPoHVouches} from './service/core/proofOfHumanity/index.js';
import {checkEndTwitterProposal} from "./service/core/twitter/index.js";
import {DaoscordClient} from "../../daoscord/lib/src/index.js";

(async () => {
    process.env.SALT = {}
    // Mutex will be used to prevent concurrent modification on aleph,
    // it's slow inefficient BUT good enough for this use-case
    const mutex = new Mutex()

    // web3.storage client
    const clientWeb3 = await makeStorageClient()

    const db = await createDb()
    const salt = {} // Salt will be used for captcha secret
    const noiseOriginal = await Jimp.read('./images/noise.png') // Noise image for captcha

    // Load last saved Database
    await loadDb(clientWeb3, db, mutex, false)

    const daoscordClient = new DaoscordClient (
        process.env.DAOSCORD_PRIVATE_KEY,
        process.env.RPC_URL,
        process.env.DAOSCORD_WEB3_TOKEN,
    )
    await daoscordClient.init()

    // Discord.js client
    const clientDiscord = await createClient(
        undefined,
        undefined,
        undefined,
        async (client) => await checkWhenReady(client, Object.values(db.data).map(d => d?.guildDiscordId)),
        (message) => onMessageCreate(message, clientDiscord, db, mutex),
        async (messageReaction, user) => await processReaction(messageReaction, user, false, db, mutex, daoscordClient),
        async (messageReaction, user) => await processReaction(messageReaction, user, true, db, mutex),
        (interaction) => processCommand(interaction, db, mutex, salt, noiseOriginal, clientDiscord, daoscordClient),
        async (guild) => await checkWhenNewGuild(guild),)

    const heartbeat = createHeartBeat(undefined, undefined, [
        {modulo: 6, func: async () => await persistDb(clientWeb3, db, mutex)},
        {modulo: 6, func: async () => await checkPoHVouches(db, mutex)},
        {modulo: 2, func: async () => await checkEndTwitterProposal(db, mutex, {client: clientDiscord})},
        {modulo: 2, func: async () => await checkEndRound(db, mutex, {client: clientDiscord})},
        {modulo: 2, func: async () => await checkEndProposal(db, mutex, {client: clientDiscord})},
    ])

    process.on('exit', async () => {
        logger.info('exit signal received.');
        await onExit();
    })

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal received.');
        await onExit();
    })

    // catches ctrl+c event
    process.on('SIGINT', async () => {
        logger.info('SIGINT signal received.');
        await onExit();
    })

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', async () => {
        logger.info('SIGUSR1 signal received.');
        await onExit();
    })
    process.on('SIGUSR2', async () => {
        logger.info('SIGUSR2 signal received.');
        await onExit();
    })

    const onExit = async () => {
        clientDiscord.destroy()
        await persistDb(clientWeb3, db, mutex)
        process.exit(0)
    }
})()
