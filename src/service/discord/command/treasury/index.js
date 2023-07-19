import {COMMANDS_NAME} from "../index.js";
import {Permissions} from "discord.js";
import logger from "../../../core/winston/index.js";
import {deploySmartAccount, summarizeAssets} from "../../../core/treasury/index.js";

/**
 * Deploy the treasury contract
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const deploy = async (interaction, guildUuid, db, mutex) => {
    try {
        if (!interaction?.options?.data
            ?.find(d => d?.name === COMMANDS_NAME.TREASURY.DEPLOY.name)) return false

        logger.debug('Deploy the treasury contract...')

        await mutex.runExclusive(async () => {
            await db.read()

            const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
                || interaction.member.roles.cache.has(db.data[guildUuid]?.config?.adminRole)
            if(!isAdmin) {
                await interaction
                    ?.reply({content: `This command is restricted to admin members`, ephemeral: true})
                    ?.catch(() => logger.error('Reply interaction failed.'))
                return true
            }

            const treasuryAddress = db.data[guildUuid].treasuryAddress
            if(db.data[guildUuid].treasuryAddress) {
                await interaction
                    ?.reply({content: `There is already a treasury contract deployed on ${treasuryAddress}`, ephemeral: true})
                    ?.catch(() => logger.error('Reply interaction failed.'))
            } else {
                await interaction?.deferReply({ ephemeral: true })
                    ?.catch(() => logger.error('Defer reply interaction failed.'))
                db.data[guildUuid].treasuryAddress = await deploySmartAccount();
                await interaction
                    ?.editReply({content: `Congrats! The treasury contract had been deployed on ${db.data[guildUuid].treasuryAddress}`, ephemeral: true})
            }
        })

        logger.debug('Deploy the treasury contract done.')

        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}

/**
 * Print the treasury assets
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const print = async (interaction, guildUuid, db, mutex) => {
    try {
        if (!interaction?.options?.data
            ?.find(d => d?.name === COMMANDS_NAME.TREASURY.PRINT.name)) return false

        logger.debug('Print the treasury assets...')

        await mutex.runExclusive(async () => {
            await db.read()
            if(!db.data[guildUuid].treasuryAddress) {
                await interaction
                    ?.reply({content: 'There are no treasury address configured yet. Deploy the contract with the command /treasury deploy', ephemeral: true})
                    ?.catch(() => logger.error('Reply interaction failed.'))
            } else {
                const assetsSummary = await summarizeAssets(interaction, guildUuid, db)
                await interaction
                    ?.reply({content: assetsSummary, ephemeral: true})
            }
        })

        logger.debug('Print the treasury assets done.')

        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}

/**
 *
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const processTreasury = async (interaction, guildUuid, db, mutex) => {
    try {
        if (interaction?.commandName !== COMMANDS_NAME.TREASURY.name) return false

        if (!guildUuid) return true

        if(await print(interaction, guildUuid, db, mutex)) return true
        if(await deploy(interaction, guildUuid, db, mutex)) return true

        await interaction
            ?.reply({content: 'Done !', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    } catch (e) {
        logger.error(e)
        await interaction
            ?.reply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    }
}