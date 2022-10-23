import logger from "../winston/index.js";
import {TwitterApiAutoTokenRefresher} from "@twitter-api-v2/plugin-token-refresher";
import {
    formatTweetsForProposal,
} from "../../discord/util/helper.js";
import {TwitterApi} from "twitter-api-v2";
import Moment from "moment";
import {decrypt, encrypt} from "../../discord/util/encryption.js";

const clients = {}

export const postOnTwitter = async (tweets, messageReaction, guildUuid, db) => {
    try {
        logger.debug('Posting on Twitter...')
        const client = getClientFor(guildUuid, db)
        let link;
        let previousTweetId;
        for(const tweetIndex in tweets) {
            if(tweetIndex === '0') {
                previousTweetId = (await client.v2.tweet(tweets[tweetIndex])).data.id
                const username = (await client.v2.me()).data.username
                link = `https://twitter.com/${username}/status/${previousTweetId}`;
            } else {
                previousTweetId = (await client.v2.reply(tweets[tweetIndex], previousTweetId)).data.id
            }
        }
        logger.debug(`Posting on Twitter done : ${link}`)
        return link
    } catch (e) {
        logger.error(e)
        await messageReaction.message.channel.send('Could not post on Twitter. Ask an admin to go check the logs to fix this error.')
        return null
    }
}

const getClientFor = (guildUuid, db) => {
    let client = clients[guildUuid]
    if (!client) {
        logger.debug(`Creating a Twitter client for ${guildUuid}`)
        const autoRefresherPlugin = new TwitterApiAutoTokenRefresher({
            refreshToken: decrypt(db.data[guildUuid].config.twitterRefreshToken),
            refreshCredentials: {
                clientId: decrypt(db.data[guildUuid].config.twitterOauth2ClientId),
                clientSecret: decrypt(db.data[guildUuid].config.twitterOauth2ClientSecret)
            },
            onTokenUpdate: (token) => {
                db.data[guildUuid].config.twitterAccessToken = encrypt(token.accessToken)
                db.data[guildUuid].config.twitterRefreshToken = encrypt(token.refreshToken)
            },
        })
        client = new TwitterApi(decrypt(db.data[guildUuid].config.twitterAccessToken), {plugins: [autoRefresherPlugin]})
        clients[guildUuid] = client
        logger.debug(`Creating a Twitter client for ${guildUuid} done.`)
    }
    return client
}

/**
 * Check if there is a Twitter proposal expired
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @param discord - Discord object with client {client: Client}
 * @returns {Promise<boolean>}
 */
export const checkEndTwitterProposal = async (db, mutex, discord) => {
    try {
        await mutex.runExclusive(async () => {
            await db.read()
            logger.debug('Check for all guild if Twitter proposal expired...')
            for (const guildUuid in db?.data) {
                const proposals = db?.data[guildUuid]?.twitterProposals

                for (const proposalId in proposals) {
                    const proposal = proposals[proposalId]
                    const endDate = Moment(proposal?.endDate)
                    if (endDate?.isAfter(Moment()))
                        continue


                    logger.debug('Retrieve Twitter post proposal message...')
                    const channel = await discord?.client?.channels
                        ?.fetch(proposal.channelId)
                        ?.catch(() => null)
                    if (!channel){
                        logger.debug('Retrieve channel proposal failed.')
                        continue
                    }
                    const proposalMessage = await channel?.messages
                        ?.fetch(proposalId)
                        ?.catch(() => null)
                    if (!proposalMessage) {
                        logger.error(`Could not retrieve Twitter post proposal (proposalId=${proposalId}, guildUuid=${guildUuid})`)
                        continue
                    }
                    logger.debug('Retrieve Twitter post proposal message done.')

                    const tokens = proposalMessage?.content.split('\n\n')
                    await proposalMessage?.edit(
                        tokens[0]
                        + formatTweetsForProposal(proposal.tweets)
                        + `\n\n**The delay expired.** The content will not be posted on Twitter.`)
                        ?.catch(() => logger.error('Failed to update proposal message.'))
                    delete db.data[guildUuid].twitterProposals[proposalId]
                }
            }
            logger.debug('Check for all guild if proposal ended done.')

            await db.write()
        })
        return true
    } catch (e) {
        logger.error(e)
        return false
    }
}