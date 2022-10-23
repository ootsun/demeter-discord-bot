import {Permissions} from 'discord.js'
import {v4 as uuidv4} from 'uuid'
import logger from '../../../../core/winston/index.js'
import {
    basicSetter,
    setDefaultReputation,
    setDuration, setMaxReputationDecay,
    setMinReputationDecay
} from '../../../../core/guild/index.js'
import {
    removeReputationRoleFromAll,
    updateReputationRole
} from '../../../reputation/reputationRole/index.js'
import {COMMANDS_NAME} from '../../index.js'
import {makeGuild} from '../../../../core/index.js'
import {makeDiscord} from '../../../data/index.js'
import {encrypt} from "../../../util/encryption.js";


/**
 * Update the admin role
 * @param adminRole - Discord role Id
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setAdminRole = async (adminRole, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    () => true,
    (guildDb) => {
        guildDb.config.adminRole = adminRole
        return guildDb
    }, db, mutex)

/**
 * Update the captcha role
 * @param captchaRole - Discord role Id
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setCaptchaRole = async (captchaRole, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    () => true,
    (guildDb) => {
        guildDb.config.captchaRole = captchaRole
        return guildDb
    }, db, mutex)

/**
 * Update the number of captcha required steps
 * @param captchaSteps - Number of steps
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setCaptchaSteps = async (captchaSteps, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => captchaSteps > 0 && captchaSteps <= 3,
    (guildDb) => {
        guildDb.config.captchaSteps = captchaSteps
        return guildDb
    }, db, mutex)

/**
 * Update the guild discord matching quantity
 * @param matching - The matching quantity
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setMatchingDiscord = async (matching, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => matching >= 0,
    (guildDb) => {
        guildDb.config.discordMatching = matching
        return guildDb
    }, db, mutex)

/**
 * Update the guild role power multiplier for QR
 * @param multiplier - multiplier apply to this role
 * @param role - Discord role id (if undefined = apply to default)
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setRolePower = async (multiplier, role, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => multiplier >= 0,
    (guildDb) => {
        if (role)
            guildDb.config.rolePowerMultipliers[role] = multiplier
        else
            guildDb.config.rolePowerMultipliers['default'] = multiplier
        return guildDb
    }, db, mutex)

/**
 * Update the guild channel grant multiplier
 * @param multiplier - multiplier apply to this role
 * @param channel - Discord channel id (if undefined = apply to default)
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setChannelMultiplier = async (multiplier, channel, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => multiplier >= 0,
    (guildDb) => {
        if (channel)
            guildDb.config.channelGrantMultipliers[channel] = multiplier
        else
            guildDb.config.channelGrantMultipliers['default'] = multiplier
        return guildDb
    }, db, mutex)

/**
 * Update the guild reaction grant quantity
 * @param grant - How much reputation will be granted when react with this emoji
 * @param reaction - if custom emoji use Discord emoji id or simple the emoji char (if undefined = apply to default)
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setReactionGrant = async (grant, reaction, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => grant >= 0,
    (guildDb) => {
        if (reaction) {
            const regex = /<:(.*):\d+>|(.)/gm
            let emoji = reaction.replace(regex, '$1') || reaction.replace(regex, '$2')
            guildDb.config.reactionGrants[emoji] = grant
        } else
            guildDb.config.reactionGrants['default'] = grant
        return guildDb
    }, db, mutex)

/**
 * Update the guild reply grant quantity
 * @param grant - How much reputation will be granted when reply
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setReplyGrant = async (grant, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => grant >= 0,
    (guildDb) => {
        guildDb.config.replyGrant = grant
        return guildDb
    }, db, mutex)


/**
 * Update the guild channel pantheon
 * @param enable - Enable pantheon for this channel
 * @param channel - Discord channel id (if undefined = apply to default)
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setChannelPantheon = async (enable, channel, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    (guildDb) => {
        guildDb.config.channelPantheons[channel] = enable
        return guildDb
    }, db, mutex)

/**
 * Update add/remove role when react to a message
 * @param message - The url of message to react
 * @param reaction - Reaction that will trigger the add/remove role
 * @param role - Which role to add/remove
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setReactionRole = async (message, reaction, role, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => {
        const regex = /<:(.*):\d+>|(.)/gm
        let emoji = reaction.replace(regex, '$1') || reaction.replace(regex, '$2')
        if (message.startsWith('https://discord.com/channels/') && emoji) return true

        return false
    },
    (guildDb) => {
        let messageId = message.split('/')
        messageId = messageId[messageId.length - 1]
        if (!messageId) return guildDb

        const regex = /<:(.*):\d+>|(.)/gm
        let emoji = reaction.replace(regex, '$1') || reaction.replace(regex, '$2')
        guildDb.reactionRoles[messageId] = {[emoji]: role}

        return guildDb
    }, db, mutex)

/**
 * Update add/remove role based on reputation earned
 * @param role - Role to add/remove
 * @param min - How much reputation needed, if not provided remove role
 * @param guildUuid - Guild unique identifier
 * @param client - Discord client
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setReputationRole = async (role, min, guildUuid, client, db, mutex) => basicSetter(
    guildUuid,
    async () => role,
    async (guildDb) => {
        if (typeof min === 'number') {
            guildDb.reputationRoles[role] = min
            const reputationRoles = {}
            reputationRoles[role] = min
            await updateReputationRole(db?.data[guildUuid]?.users, reputationRoles, db?.data[guildUuid]?.guildDiscordId, {client})
        } else {
            delete guildDb.reputationRoles[role]
            await removeReputationRoleFromAll(guildDb.users, role, db.data[guildUuid]?.guildDiscordId, {client})
        }
        return guildDb
    }, db, mutex)

/**
 * Update how much reputation is required to transfer a message
 * @param reputation - How much reputation
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setReactionTransferReputation = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === 'number',
    async (guildDb) => {
        guildDb.config.minReputationTransfer = reputation
        return guildDb
    }, db, mutex)

/**
 * Update which reaction will transfer to which channel
 * @param reaction - Reaction that will trigger the transfer
 * @param channel - Where to transfer
 * @param reputation - Override how much reputation is required to transfer a message
 * @param deleteMessage - Whether the original message should be deleted after transfer
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setReactionTransfer = async (reaction, channel, reputation, deleteMessage = true, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => {
        const regex = /<:(.*):\d+>|(.)/gm
        let emoji = reaction.replace(regex, '$1') || reaction.replace(regex, '$2')
        return !!emoji
    },
    async (guildDb) => {
        const regex = /<:(.*):\d+>|(.)/gm
        let emoji = reaction.replace(regex, '$1') || reaction.replace(regex, '$2')
        if (channel)
            guildDb.reactionTransfers[emoji] = {
                channel,
                reputation,
                deleteMessage
            };
        else
            delete guildDb.reactionTransfers[emoji]
        return guildDb
    }, db, mutex)

/**
 * Update the min reputation to start a proposal
 * @param reputation - how much reputation
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setMinReputationStartProposal = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === 'number',
    async (guildDb) => {
        guildDb.config.minReputationToStartProposal = reputation
        return guildDb
    }, db, mutex)

/**
 * Update the min reputation to accept the vote of a proposal
 * @param reputation - how much reputation
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setMinReputationConfirmProposal = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === 'number',
    async (guildDb) => {
        guildDb.config.minReputationToConfirmProposal = reputation
        return guildDb
    }, db, mutex)

/**
 * Update the channel where to post the proposal
 * @param channel - Channel to post
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setChannelProposal = async (channel, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => !!channel,
    (guildDb) => {
        guildDb.config.channelProposal = channel
        return guildDb
    }, db, mutex)

/**
 * Update the min reputation to mute someone
 * @param reputation - how much reputation
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setMinReputationMute = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === 'number',
    async (guildDb) => {
        guildDb.config.minReputationToMute = reputation
        return guildDb
    }, db, mutex)

/**
 * Update the user blacklist
 * @param userDiscordId - user Discord id
 * @param enable - Add/remove from blacklist
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setBlacklist = async (userDiscordId, enable, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => !!userDiscordId,
    async (guildDb) => {
        guildDb.blacklist ||= {}
        guildDb.blacklist[userDiscordId] = enable
        return guildDb
    }, db, mutex)

/**
 * Update the amount of reputation rewarded to vouchers
 * @param reputation - The amount of reputation rewarded to vouchers
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setPohVouchersReward = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === 'number',
    async (guildDb) => {
        guildDb.config.pohVouchersReward = reputation
        return guildDb
    }, db, mutex)

/**
 * Update how much reputation is required to ignore a message
 * @param reputation - How much reputation
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setMinReputationIgnore = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === 'number',
    async (guildDb) => {
        guildDb.config.minReputationIgnore = reputation
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter admin role
 * @param role - Twitter admin role
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterAdminRole = async (role, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    async (guildDb) => {
        guildDb.config.twitterAdminRole = role
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter member role
 * @param role - Twitter member role
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterMemberRole = async (role, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    async (guildDb) => {
        guildDb.config.twitterMemberRole = role
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter proposal duration
 * @param duration - Twitter proposal duration
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterProposalDuration = async (duration, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof duration === "number" && duration > 0,
    async (guildDb) => {
        guildDb.config.twitterProposalDuration = duration
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter minimum reputation required to validate a proposal
 * @param reputation - Twitter proposal minimum reputation
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterMinRepProposal = async (reputation, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof reputation === "number" && reputation >= 0,
    async (guildDb) => {
        guildDb.config.twitterMinRepProposal = reputation
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter proposal duration
 * @param minInFavorMembers - Twitter proposal minimum in favor members
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterMinInFavorMembers = async (minInFavorMembers, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => typeof minInFavorMembers === "number" && minInFavorMembers > 0,
    async (guildDb) => {
        guildDb.config.twitterMinInFavorMembers = minInFavorMembers
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter access token used to authenticate against the Twitter API v2
 * @param token - Twitter access token
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterAccessToken = async (token, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    async (guildDb) => {
        guildDb.config.twitterAccessToken = encrypt(token)
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter refresh token used to authenticate against the Twitter API v2
 * @param token - Twitter refresh token
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterRefreshToken = async (token, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    async (guildDb) => {
        guildDb.config.twitterRefreshToken = encrypt(token)
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter Oauth2 client id used to authenticate against the Twitter API v2
 * @param twitterOauth2ClientId - Twitter Oauth2 client id
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterOauth2ClientId = async (twitterOauth2ClientId, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    async (guildDb) => {
        guildDb.config.twitterOauth2ClientId = encrypt(twitterOauth2ClientId)
        return guildDb
    }, db, mutex)

/**
 * Update the Twitter Oauth2 client secret used to authenticate against the Twitter API v2
 * @param twitterOauth2ClientSecret - Twitter Oauth2 client secret
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param mutex - Mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const setTwitterOauth2ClientSecret = async (twitterOauth2ClientSecret, guildUuid, db, mutex) => basicSetter(
    guildUuid,
    async () => true,
    async (guildDb) => {
        guildDb.config.twitterOauth2ClientSecret = encrypt(twitterOauth2ClientSecret)
        return guildDb
    }, db, mutex)

/**
 * Initialize the guild
 * @param guildDiscordId - Guild discord id
 * @param db - in-memory database
 * @param mutex - mutex to access the database safely
 * @returns {Promise<boolean>}
 */
export const initGuild = async (guildDiscordId, db, mutex) => {
    try {
        const guildUuid = uuidv4()

        await mutex.runExclusive(async () => {
            await db.read()
            db.data[guildUuid] = makeGuild(makeDiscord.makeGuild(guildDiscordId))
            await db.write()
        })

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
export const configGuild = async (interaction, guildUuid, db, mutex) => {
    try {
        if (interaction?.commandName !== COMMANDS_NAME.GUILD.name) return false

        const options = interaction?.options?.data
            ?.find(d => d?.name === COMMANDS_NAME.GUILD.CONFIG.name)?.options
        const options2 = interaction?.options?.data
            ?.find(d => d?.name === COMMANDS_NAME.GUILD.CONFIG_2.name)?.options
        const optionsTwitter = interaction?.options?.data
            ?.find(d => d?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.name)?.options

        if (!options && !options2 &&!optionsTwitter) return false

        let isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)

        logger.debug('guildUuid ' + guildUuid)
        if (!guildUuid) {
            logger.debug('isAdmin ' + isAdmin)
            if (!isAdmin) return true
            await initGuild(interaction?.guildId, db, mutex)
            await db.read()

            guildUuid = Object.keys(db?.data)
                ?.find(uuid => db?.data[uuid]?.guildDiscordId === interaction?.guildId)
            if (!guildUuid) return true
        }

        isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
            || interaction.member.roles.cache.has(db.data[guildUuid]?.config?.adminRole)
        if (!isAdmin) return true

        let response = ''

        const adminRole = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.ADMIN_ROLE.name)?.value
        if (adminRole)
            if (!await setAdminRole(adminRole, guildUuid, db, mutex))
                response += ''

        const captchaRole = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.CAPTCHA_ROLE.name)?.value
        if (captchaRole)
            if (!await setCaptchaRole(captchaRole, guildUuid, db, mutex))
                response += ''

        const captchaSteps = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.CAPTCHA_STEPS.name)?.value
        if (captchaSteps)
            if (!await setCaptchaSteps(captchaSteps, guildUuid, db, mutex))
                response += 'Number of captcha steps need to be > 0 and <= 3\n'

        const defaultReputation = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.DEFAULT_REPUTATION.name)?.value
        if (typeof defaultReputation === 'number')
            if (!await setDefaultReputation(defaultReputation, guildUuid, db, mutex))
                response += 'How much will receive a new user need to be >= 0\n'

        const discordMatching = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.DISCORD_MATCHING.name)?.value
        if (typeof discordMatching === 'number')
            if (!await setMatchingDiscord(discordMatching, guildUuid, db, mutex))
                response += 'Default reputation for Quadratic funding need to be >= 0\n'

        const duration = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.DURATION.name)?.value
        if (typeof duration === 'number')
            if (!await setDuration(duration, guildUuid, db, mutex))
                response += 'Duration of each round in days need to be > 0\n'

        const minDecay = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.MIN_DECAY.name)?.value
        if (typeof minDecay === 'number')
            if (!await setMinReputationDecay(minDecay, guildUuid, db, mutex))
                response += 'Min reputation decay in percent at each round(eg: 0.01) need to be >= 0 and =< 1 and <= max decay\n'

        const maxDecay = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.MAX_DECAY.name)?.value
        if (typeof maxDecay === 'number')
            if (!await setMaxReputationDecay(maxDecay, guildUuid, db, mutex))
                response += 'Max reputation decay in percent at each round(eg: 0.01) need to be >= 0 and =< 1 and >= min decay\n'

        const roleMultiplier = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.ROLE_MULTIPLIER.name)?.value
        const role = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.ROLE.name)?.value
        if (typeof roleMultiplier === 'number')
            if (!await setRolePower(roleMultiplier, role, guildUuid, db, mutex))
                response += 'Power multiplier for this role need to be >= 0\n'

        const channelMultiplier = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.CHANNEL_MULTIPLIER.name)?.value
        const channel = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.CHANNEL.name)?.value
        if (typeof channelMultiplier === 'number')
            if (!await setChannelMultiplier(channelMultiplier, channel, guildUuid, db, mutex))
                response += 'Grant multiplier for this channel need to be >= 0\n'

        const reactionGrant = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REACTION_GRANT.name)?.value
        const reaction = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REACTION.name)?.value
        if (typeof reactionGrant === 'number')
            if (!await setReactionGrant(reactionGrant, reaction, guildUuid, db, mutex))
                response += 'How much will be granted per reaction need to be >= 0\n'

        const replyGrant = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REPLY_GRANT.name)?.value
        if (replyGrant)
            if (!await setReplyGrant(replyGrant, guildUuid, db, mutex))
                response += 'How much will be granted per reply need to be >= 0\n'

        const channelPantheonEnable = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.CHANNEL_PANTHEON_ENABLE.name)?.value
        const channelPantheon = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.CHANNEL_PANTHEON.name)?.value
        if (channelPantheon)
            if (!await setChannelPantheon(channelPantheonEnable, channelPantheon, guildUuid, db, mutex))
                response += 'Set pantheon failed.'

        const reactionRoleMessage = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REACTION_ROLE_MESSAGE.name)?.value
        const reactionRoleReaction = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REACTION_ROLE_REACTION.name)?.value
        const reactionRoleRole = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REACTION_ROLE_ROLE.name)?.value
        if (reactionRoleMessage && reactionRoleReaction)
            if (!await setReactionRole(reactionRoleMessage, reactionRoleReaction, reactionRoleRole, guildUuid, db, mutex))
                response += 'Please provide at least a message link and an emoji(if no role = remove)'

        const reputationRoleRole = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REPUTATION_ROLE_ROLE.name)?.value
        const reputationRoleMin = options?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG.REPUTATION_ROLE_MIN.name)?.value
        if (reputationRoleRole)
            if (!await setReputationRole(reputationRoleRole, reputationRoleMin, guildUuid, interaction.client, db, mutex))
                response += 'Please provide at least a role(if no min = remove)'

        const minReputationStartProposal = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_START_PROPOSAL.name)?.value
        if (typeof minReputationStartProposal === 'number')
            if (!await setMinReputationStartProposal(minReputationStartProposal, guildUuid, db, mutex))
                response += 'The minimum reputation to start a proposal should be a number(0 = no proposal)'

        const minReputationConfirmProposal = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_CONFIRM_PROPOSAL.name)?.value
        if (typeof minReputationConfirmProposal === 'number')
            if (!await setMinReputationConfirmProposal(minReputationConfirmProposal, guildUuid, db, mutex))
                response += 'The minimum reputation to accept a proposal should be a number(0 = no proposal)'

        const minReputationMute = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_MUTE.name)?.value
        if (typeof minReputationMute === 'number')
            if (!await setMinReputationMute(minReputationMute, guildUuid, db, mutex))
                response += 'The minimum reputation to mute should be a number(0 = no mute)'

        const channelProposal = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.CHANNEL_PROPOSAL.name)?.value
        if (channelProposal)
            if (!await setChannelProposal(channelProposal, guildUuid, db, mutex))
                response += 'Where to post the proposal'

        const blacklistUser = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.BLACKLIST_USER.name)?.value
        const blacklistEnable = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.BLACKLIST_USER_ENABLE.name)?.value
        if (blacklistUser)
            if (!await setBlacklist(blacklistUser, blacklistEnable, guildUuid, db, mutex))
                response += 'Please provide a user to add/remove from blacklist'

        const pohVouchersReward = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.POH_VOUCHERS_REWARD.name)?.value
        if (typeof pohVouchersReward === 'number')
            await setPohVouchersReward(pohVouchersReward, guildUuid, db, mutex)

        const minReputationIgnore = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_IGNORE.name)?.value
        if (minReputationIgnore)
            if (!await setMinReputationIgnore(minReputationIgnore, guildUuid, db, mutex))
                response += 'The minimum reputation to ignore a message should be a number(0 = ignore feature disabled)'

        const reactionTransferReaction = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_REACTION.name)?.value
        const reactionTransferChannel = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_CHANNEL.name)?.value
        const reactionTransferOverrideReputation = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_OVERRIDE_REPUTATION.name)?.value
        const reactionTransferDelete = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_DELETE.name)?.value
        if (reactionTransferReaction)
            if (!await setReactionTransfer(reactionTransferReaction, reactionTransferChannel, reactionTransferOverrideReputation, reactionTransferDelete, guildUuid, db, mutex))
                response += 'Please provide at least a reaction(if no channel = remove)'

        const reactionTransferReputation = options2?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_REPUTATION.name)?.value
        if (typeof reactionTransferReputation === 'number')
            if (!await setReactionTransferReputation(reactionTransferReputation, guildUuid, db, mutex))
                response += 'The minimum reputation to transfer a message should be a number(0 = no transfer)'

        const twitterAdminRole = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.TWITTER_ADMIN_ROLE.name)?.value
        if (twitterAdminRole)
            if (!await setTwitterAdminRole(twitterAdminRole, guildUuid, db, mutex))
                response += 'Please select a role'
        const twitterMemberRole = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.TWITTER_MEMBER_ROLE.name)?.value
        if (twitterMemberRole)
            if (!await setTwitterMemberRole(twitterMemberRole, guildUuid, db, mutex))
                response += 'Please select a role'
        const twitterProposalDuration = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.PROPOSAL_DURATION.name)?.value
        if (twitterProposalDuration !== undefined)
            if (!await setTwitterProposalDuration(twitterProposalDuration, guildUuid, db, mutex))
                response += 'The minimum duration must be a non-null positive number (in days)'
        const twitterMinRepProposal = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.MIN_REPUTATION_PROPOSAL.name)?.value
        if (twitterMinRepProposal !== undefined)
            if (!await setTwitterMinRepProposal(twitterMinRepProposal, guildUuid, db, mutex))
                response += 'The minimum reputation must be a positive number'
        const twitterMinInFavorMembers = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.MIN_IN_FAVOR_MEMBERS.name)?.value
        if (twitterMinInFavorMembers !== undefined)
            if (!await setTwitterMinInFavorMembers(twitterMinInFavorMembers, guildUuid, db, mutex))
                response += 'The minimum in favor members must be a non-null positive number'
        const twitterAccessToken = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.ACCESS_TOKEN.name)?.value
        if (twitterAccessToken)
            !await setTwitterAccessToken(twitterAccessToken, guildUuid, db, mutex)
        const twitterRefreshToken = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.REFRESH_TOKEN.name)?.value
        if (twitterRefreshToken)
            await setTwitterRefreshToken(twitterRefreshToken, guildUuid, db, mutex)
        const twitterOauth2ClientId = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.OAUTH2_CLIENT_ID.name)?.value
        if (twitterOauth2ClientId)
            await setTwitterOauth2ClientId(twitterOauth2ClientId, guildUuid, db, mutex)
        const twitterOauth2ClientSecret = optionsTwitter?.find(o => o?.name === COMMANDS_NAME.GUILD.CONFIG_TWITTER.OAUTH2_CLIENT_SECRET.name)?.value
        if (twitterOauth2ClientSecret)
            await setTwitterOauth2ClientSecret(twitterOauth2ClientSecret, guildUuid, db, mutex)

        await interaction
            ?.reply({content: response || 'Done !', ephemeral: true})
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
