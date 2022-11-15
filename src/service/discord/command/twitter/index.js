import {COMMANDS_NAME} from '../index.js';
import logger from '../../../core/winston/index.js';
import Moment from 'moment';
import {
    formatTweetsForProposal,
} from '../../util/helper.js';
import {makeDiscord} from "../../data/index.js";
import {MessageMentions} from 'discord.js';
import twitterText from 'twitter-text';

const tweetMaxLength = 280
const contentCutSuffix = '...'

/**
 *
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @param client - Discord Client
 * @returns {Promise<boolean>}
 */
export const processTwitter = async (interaction, guildUuid, db, mutex, client) => {
    try {
        if (!guildUuid) return true

        if (await proposeTwitterPost(interaction, guildUuid, db, mutex, client)) return true

        return false;
    } catch (e) {
        logger.error(e)
        await interaction
            ?.reply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    }
}

/**
 * Start a proposal for a Twitter post
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @param client - Discord Client
 * @returns {Promise<boolean>}
 */
const proposeTwitterPost = async (interaction, guildUuid, db, mutex, client) => {
    try {
        if (interaction?.commandName !== COMMANDS_NAME.TWITTER_POST.name) return false

        logger.debug('Starting a proposal for a Twitter post...')
        const twitterAdminRole = db.data[guildUuid].config.twitterAdminRole
        const twitterProposalDuration = db.data[guildUuid].config.twitterProposalDuration
        const twitterMinRepProposal = db.data[guildUuid].config.twitterMinRepProposal
        const twitterMinInFavorMembers = db.data[guildUuid].config.twitterMinInFavorMembers

        if (!twitterAdminRole) {
            await interaction
                ?.reply({content: 'Twitter admin is not yet configured !', ephemeral: true})
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!twitterProposalDuration) {
            await interaction
                ?.reply({content: 'Twitter proposal duration is not yet configured !', ephemeral: true})
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!twitterMinInFavorMembers) {
            await interaction
                ?.reply({content: 'Twitter minimum in favor members is not yet configured !', ephemeral: true})
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!twitterMinRepProposal) {
            await interaction
                ?.reply({
                    content: 'This feature is disabled. Configure Twitter minimum reputation proposal to enable it !',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!db.data[guildUuid].config.twitterRefreshToken) {
            await interaction
                ?.reply({
                    content: 'This feature is disabled. Configure Twitter refresh token to enable it !',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!db.data[guildUuid].config.twitterAccessToken) {
            await interaction
                ?.reply({
                    content: 'This feature is disabled. Configure Twitter access token to enable it !',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!db.data[guildUuid].config.twitterOauth2ClientId) {
            await interaction
                ?.reply({
                    content: 'This feature is disabled. Configure Twitter Oauth2 client id to enable it !',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!db.data[guildUuid].config.twitterOauth2ClientSecret) {
            await interaction
                ?.reply({
                    content: 'This feature is disabled. Configure Twitter Oauth2 client secret to enable it !!',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!twitterMinRepProposal) {
            await interaction
                ?.reply({
                    content: 'This feature is disabled. Configure Twitter minimum reputation proposal to enable it !',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        if (!interaction.member.roles.cache.has(twitterAdminRole)) {
            await interaction
                ?.reply({
                    content: 'Starting a proposal is a right reserved for Twitter admins exclusively !' +
                        '\n\nYou should hide this feature to other roles by toggling the option in the Discord Server parameters. ' +
                        'Look for application commands under the "Integration" panel.',
                    ephemeral: true
                })
                ?.catch(() => logger.error('Reply interaction failed.'))
            return true
        }

        const proposals = db?.data[guildUuid]?.twitterProposals
        if (proposals) {
            for (const proposalId in proposals) {
                const proposal = proposals[proposalId]
                if (proposal.targetMessageId === interaction.targetId) {
                    await interaction
                        ?.reply({
                            content: 'A proposal is already ongoing for this post.',
                            ephemeral: true
                        })
                        ?.catch(() => logger.error('Reply interaction failed.'))
                    return true
                }
            }
        }

        const targetMessage = await interaction.channel.messages
            ?.fetch(interaction.targetId)
            ?.catch(() => null);
        const postContent = removeMentions(targetMessage.content, client)
        const tweets = splitContentIntoTweets(postContent)
        const startDate = Moment()
        const endDate = Moment(startDate).add(twitterProposalDuration, 'days')

        logger.debug('Create proposal...')
        let proposalDescription = `<@!${interaction.member.id}> suggests posting the following content on Twitter.`
            + `\n\nYou have until ${endDate?.format('dddd, MMMM Do YYYY, h:mm a')} to vote.`
            + formatTweetsForProposal(tweets)

        const proposalMessage = await interaction.channel
            ?.send(proposalDescription)
            ?.catch(() => null)
        if (!proposalMessage) {
            logger.error('Failed to post proposal.')
            return true
        }
        await proposalMessage
            ?.react('✅')
            ?.catch(() => logger.error('Failed to react start proposal.'))
        await proposalMessage
            ?.react('❌')
            ?.catch(() => logger.error('Failed to react start proposal.'))

        if (db.data[guildUuid].twitterProposals === undefined)
            db.data[guildUuid].twitterProposals = {}
        db.data[guildUuid].twitterProposals[proposalMessage.id] = makeDiscord.makeTwitterPostProposal(
            endDate,
            tweets,
            interaction.channel.id,
            interaction.targetId
        )
        await db.write()

        await interaction
            ?.reply({content: 'Done !', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))

        logger.debug('Create proposal done.')
        logger.debug('Start a proposal for a Twitter post done.')
        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}

const removeMentions = (text, client) => {
    let matches = text.matchAll(MessageMentions.USERS_PATTERN).next().value
    while (matches) {
        const id = matches[1]
        let user = client.users.cache.get(id)
        text = text.replaceAll(matches[0], `@${user.username}`)
        matches = text.matchAll(MessageMentions.USERS_PATTERN).next().value
    }
    return text
}

const splitContentIntoTweets = (content, tweets = []) => {
    const contentWeightedLength = twitterText.parseTweet(content).weightedLength
    if(contentWeightedLength > tweetMaxLength) {
        const slice = content.slice(0, tweetMaxLength)
        const lastNewLineIndex = slice.lastIndexOf('\n')
        let tweet;
        let remainingContent;
        const indexOfLinkThatWillBeCut = indexOfLinkThatWillBeCut(content);
        if(lastNewLineIndex > -1) {
            tweet = slice.slice(0, lastNewLineIndex)
            remainingContent = content.slice(lastNewLineIndex)
        } else if(indexOfLinkThatWillBeCut < 0) {
            tweet = slice.slice(0, tweetMaxLength - contentCutSuffix.length) + contentCutSuffix
            remainingContent = content.slice(tweetMaxLength - contentCutSuffix.length)
        } else {
            tweet = slice.slice(0, indexOfLinkThatWillBeCut) + contentCutSuffix
            remainingContent = content.slice(indexOfLinkThatWillBeCut)
        }
        tweets.push(tweet)
        return splitContentIntoTweets(remainingContent, tweets)
    }
    tweets.push(content)
    return tweets
}

const indexOfLinkThatWillBeCut = (text) => {
    const expressionForUrls = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
    const regex = new RegExp(expressionForUrls)

    const contentKeptLength = tweetMaxLength - contentCutSuffix.length;
    const matches = text.matchAll(regex);
    for(let match of matches) {
        // eg.: If contentKeptLength == 20 and text == Hello https://ethereum.org
        // Then match['index'] == 6 and match[0].length == 20
        // So 6 - 20 + 20 > 0
        if(match['index'] - contentKeptLength + match[0].length > 0) {
            return match['index']
        }
    }
    return -1
}
