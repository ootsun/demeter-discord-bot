import {fetchReaction} from '../../util/helperDiscord.js'
import logger from '../../../core/winston/index.js'

/**
 * Transfer one message to another channel if enough reputation react
 * @param messageReaction - Discord message reaction
 * @param user - Discord user author of this reaction
 * @param isRemove - True if the author remove his reaction, false if the author react
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const transferMessage = async (messageReaction, user, isRemove, guildUuid, db, mutex) => {
    try {
        await db.read()
        let guildDb = db?.data[guildUuid];
        if(!guildDb?.reactionTransfers[messageReaction?.emoji?.name]
            || !guildDb?.config?.minReputationTransfer)return true

        if(!guildDb.undeletedTransferredMessages) {
            guildDb.undeletedTransferredMessages = {}
        }
        if(Object.keys(guildDb.undeletedTransferredMessages).includes(messageReaction?.message.id)) {
            logger.debug('Message has already been moved but not deleted.')
            return true
        }

        logger.debug('Fetch all reactions...')
        const reactions = await fetchReaction(messageReaction?.message, {})
        if (!reactions?.length)return true

        const discordIdList = reactions
            .filter(r => r?.emoji === messageReaction?.emoji?.name)
            .map(r => r?.senderDiscordId)
        logger.debug('Fetch all reactions done.')

        logger.debug('Check if enough reputation...')
        const reactionTransferChannelConfig = guildDb?.reactionTransfers[messageReaction?.emoji?.name];
        const allCollectedReputation = [...Object.values(guildDb?.users)
            .filter(u => discordIdList?.includes(u?.discordId))
            .map(u => u?.reputations[u?.reputations?.length - 1]), 0]
            .reduce((a, n) => a + n);
        if(reactionTransferChannelConfig.reputation !== undefined && reactionTransferChannelConfig.reputation > allCollectedReputation)
            return true
        if(reactionTransferChannelConfig.reputation === undefined && guildDb?.config?.minReputationTransfer > allCollectedReputation)
            return true
        logger.debug('Check if enough reputation done.')

        logger.debug('Transfer message...')
        const channel = await messageReaction?.message?.guild?.channels
            ?.fetch(reactionTransferChannelConfig.channel || reactionTransferChannelConfig)
            ?.catch(() => null)
        if (!channel) return true

        const message = await messageReaction?.message?.channel?.messages
            ?.fetch(messageReaction?.message?.id)
            ?.catch(() => null)
        if (!message) return true

        const files = message?.attachments && message?.attachments?.size ?  [...message?.attachments?.values()] : null
        await channel
            ?.send({content: `${message?.author} (transferred by the community) :\n${message.content}`, files, allowedMentions: { parse: ['users'] }})
            ?.catch(() => logger.error('Failed to transfer message.'))

        if (reactionTransferChannelConfig.deleteMessage === undefined || reactionTransferChannelConfig.deleteMessage === true) {
            await message
                ?.delete()
                ?.catch(() => logger.error('Failed to remove original message.'))
        } else {
            guildDb.undeletedTransferredMessages[messageReaction?.message.id] = true
        }
        await db.write()
        logger.debug('Transfer message done.')

        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}

/**
 *
 * @param messageReaction - Discord message reaction
 * @param user - Discord user author of this reaction
 * @param isRemove - True if the author remove his reaction, false if the author react
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const processReactionTransfer = async (messageReaction, user, isRemove, guildUuid, db, mutex) => {
    try {
        if (await transferMessage(messageReaction, user, isRemove, guildUuid, db, mutex)) return true

        return false
    } catch (e) {
        logger.error(e)
        await messageReaction.message.channel.send('Something went wrong...')
        return true
    }
}
