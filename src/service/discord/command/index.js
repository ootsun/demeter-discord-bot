import {Collection} from 'discord.js'
import logger from '../../core/winston/index.js'
import {processButton} from '../button/index.js'
import {processGuild} from './guild/index.js'
import {processGrant} from './reputation/grant/index.js'
import {processReputation} from './reputation/index.js'
import {ApplicationCommandOptionTypes} from '../util/discordConstant.js'
import {processPrintButton} from './button/index.js'
import {processRound} from './round/index.js'
import {processProposal} from './proposal/index.js'
import {processUser} from './user/index.js'
import {processGiveaway} from "./giveaway/index.js";
import {processProofOfHumanity} from './proofOfHumanity/index.js';
import {processTwitter} from './twitter/index.js';
import {processTreasury} from "./treasury/index.js";

export const COMMANDS_NAME = {
    GUILD: {
        name: 'guild',
        CONFIG: {
            name: 'config',

            ADMIN_ROLE: {name: 'admin-role'},

            CAPTCHA_ROLE: {name: 'captcha-role'},
            CAPTCHA_STEPS: {name: 'captcha-steps'},

            DEFAULT_REPUTATION: {name: 'default-reputation'},

            DISCORD_MATCHING: {name: 'discord-matching'},
            DURATION: {name: 'duration'},
            MIN_DECAY: {name: 'min-decay'},
            MAX_DECAY: {name: 'max-decay'},

            ROLE: {name: 'role'},
            ROLE_MULTIPLIER: {name: 'role-multiplier'},

            CHANNEL: {name: 'channel'},
            CHANNEL_MULTIPLIER: {name: 'channel-multiplier'},

            REACTION: {name: 'reaction'},
            REACTION_GRANT: {name: 'reaction-grant'},

            REPLY_GRANT: {name: 'reply-grant'},

            CHANNEL_PANTHEON: {name: 'channel-pantheon'},
            CHANNEL_PANTHEON_ENABLE: {name: 'channel-pantheon-enable'},

            REACTION_ROLE_MESSAGE: {name: 'reaction-role-message'},
            REACTION_ROLE_REACTION: {name: 'reaction-role-reaction'},
            REACTION_ROLE_ROLE: {name: 'reaction-role-role'},

            REPUTATION_ROLE_ROLE: {name: 'reputation-role-role'},
            REPUTATION_ROLE_MIN: {name: 'reputation-role-min'},
        },
        CONFIG_2: {
            name: 'config-2',

            MIN_REPUTATION_START_PROPOSAL: {name: 'min-rep-start-proposal'},
            MIN_REPUTATION_CONFIRM_PROPOSAL: {name: 'min-rep-confirm-proposal'},
            CHANNEL_PROPOSAL: {name: 'channel-proposal'},

            MIN_REPUTATION_MUTE: {name: 'min-rep-mute'},

            BLACKLIST_USER: {name: 'blacklist-user'},
            BLACKLIST_USER_ENABLE: {name: 'blacklist-user-enable'},

            POH_VOUCHERS_REWARD: {name: 'poh-vouchers-reward'},

            MIN_REPUTATION_IGNORE: {name: 'min-reputation-ignore'},

            REACTION_TRANSFER_REPUTATION: {name: 'reaction-transfer-reputation'},
            REACTION_TRANSFER_REACTION: {name: 'reaction-transfer-reaction'},
            REACTION_TRANSFER_CHANNEL: {name: 'reaction-transfer-channel'},
            REACTION_TRANSFER_OVERRIDE_REPUTATION: {name: 'reaction-transfer-override-repu'},
            REACTION_TRANSFER_DELETE: {name: 'reaction-transfer-delete'},
        },
        CONFIG_TWITTER: {
            name: 'config-twitter',

            TWITTER_ADMIN_ROLE: {name: 'twitter-admin-role'},
            TWITTER_MEMBER_ROLE: {name: 'twitter-member-role'},
            PROPOSAL_DURATION: {name: 'twitter-proposal-duration'},
            MIN_REPUTATION_PROPOSAL: {name: 'twitter-min-rep-proposal'},
            MIN_IN_FAVOR_MEMBERS: {name: 'twitter-min-in-favor-members'},
            ACCESS_TOKEN: {name: 'twitter-access-token'},
            REFRESH_TOKEN: {name: 'twitter-refresh-token'},
            OAUTH2_CLIENT_ID: {name: 'twitter-oauth2-client-id'},
            OAUTH2_CLIENT_SECRET: {name: 'twitter-oauth2-client-secret'},
        },
        DB_URL: {name: 'db-url'}
    },
    ROUND: {
        name: 'round',
        CONFIG: {
            name: 'config',

            ROUND_SHIFT: {name: 'round-shift'},

            APPLY_GUILD_DEFAULT: {name: 'apply-guild-default'},

            DEFAULT_REPUTATION: {name: 'default-reputation'},

            DISCORD_MATCHING: {name: 'discord-matching'},
            DURATION: {name: 'duration'},
            MIN_DECAY: {name: 'min-decay'},
            MAX_DECAY: {name: 'max-decay'},

            ROLE: {name: 'role'},
            ROLE_MULTIPLIER: {name: 'role-multiplier'},

            CHANNEL: {name: 'channel'},
            CHANNEL_MULTIPLIER: {name: 'channel-multiplier'},

            REACTION: {name: 'reaction'},
            REACTION_GRANT: {name: 'reaction-grant'},

            REPLY_GRANT: {name: 'reply-grant'}
        },
        START_FIRST: {
            name: 'start-first'
        }
    },
    USER: {
        name: 'user',

        CONFIG: {
            name: 'config',

            APPLY_GUILD_DEFAULT: {name: 'apply-guild-default'},

            CHANNEL: {name: 'channel'},
            CHANNEL_MULTIPLIER: {name: 'channel-multiplier'},

            REACTION: {name: 'reaction'},
            REACTION_GRANT: {name: 'reaction-grant'},

            REPLY_GRANT: {name: 'reply-grant'},
        },
        UNMUTE: {
            name: 'unmute',

            USER: {name: 'user'}
        }
    },
    REPUTATION: {
        name: 'reputation',

        TOP: {
            name: 'top',

            START: {name: 'start'},
        },
        GRANT_LIST: {
            name: 'grant-list',

            USER: {name: 'user'},
            ROUND: {name: 'round'},
        },
        GRANT_ADD: {
            name: 'grant-add',

            USER: {name: 'user'},
            AMOUNT: {name: 'amount'},
        },
        GRANT_SET: {
            name: 'grant-set',

            USER: {name: 'user'},
            AMOUNT: {name: 'amount'},
        },
        FETCH_HISTORY: {
            name: 'fetch-history',

            START_DATE: {name: 'start-date'}
        },
        RECOMPUTE_REPUTATION: {
            name: 'recompute-reputation',

            USE_GUILD_CONFIG: {name: 'use-guild-config'}
        }
    },
    BUTTON: {
        name: 'button',

        CAPTCHA: {
            name: 'captcha'
        },
        GUILD_INFO: {
            name: 'guild-info'
        },
        USER_INFO: {
            name: 'user-info'
        },
        MANUAL: {
            name: 'manual'
        },

    },
    PROPOSAL: {
        name: 'proposal',

        START: {
            name: 'start',

            MESSAGE: { name: 'message'},
            DURATION: { name: 'duration'},
            MINT_USER: { name: 'mint-user'},
            MINT_AMOUNT: { name: 'mint-qty'}
        },
        MUTE: {
            name: 'mute',
            USER: {name: 'user'},
            DURATION: {name: 'duration'},
        },
        START_TREASURY: {
            name: 'start-treasury',

            MESSAGE: {name: 'message'},
            DURATION: {name: 'duration'},
            ADDRESS: {name: 'address'},
            CHAIN: {name: 'chain'},
            ASSET: {name: 'asset'},
            ASSET_AMOUNT: {name: 'amount'},
        },
    },
    GIVEAWAY: {
        name: 'giveaway',

        MESSAGE: {name: 'message'},
        WEIGHTED: {name: 'weighted'},
    },
    POH: {
        name: 'poh',

        REGISTER: {
            name: 'register',

            PROFILE_URL: {
                name: 'profile-url'
            }
        },
        UNREGISTER: {
            name: 'unregister'
        },
        LIST: {
            name: 'list'
        },
        LIST_VOUCHED: {
            name: 'list-vouched'
        },
        VOUCH: {
            name: 'vouch',

            USER: {
                name: 'user'
            }
        },
        THANK_VOUCHER: {
            name: 'thank-voucher'
        }
    },
    TWITTER_POST: {
        name: 'Tweet with Demeter'
    },
    TREASURY: {
        name: 'treasury',

        DEPLOY: {
            name: 'deploy',
        },
        PRINT: {
            name: 'print',
        },
    },
}

export const COMMANDS = [
    {
        name: COMMANDS_NAME.GUILD.name, description: 'Demeter guild', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.GUILD.CONFIG.name,
                description: 'Config guild(admin only)',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG.ADMIN_ROLE.name,
                        description: 'Set admin role',
                    }, {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG.CAPTCHA_ROLE.name,
                        description: 'Set captcha role',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.CAPTCHA_STEPS.name,
                        description: 'Set number of required captcha steps',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.DEFAULT_REPUTATION.name,
                        description: 'Default Reputation for new member',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.DISCORD_MATCHING.name,
                        description: 'How much reputation to add to QR',
                    }, {
                        type: ApplicationCommandOptionTypes.INTEGER,
                        name: COMMANDS_NAME.GUILD.CONFIG.DURATION.name,
                        description: 'Duration of each round in days',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.MIN_DECAY.name,
                        description: 'Min reputation decay in percent at each round(eg: 0.01)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.MAX_DECAY.name,
                        description: 'Max reputation decay in percent at each round(eg: 0.01)',
                    }, {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG.ROLE.name,
                        description: 'Role to apply the power multiplier(not specified=default)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.ROLE_MULTIPLIER.name,
                        description: 'Power multiplier for this role(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        name: COMMANDS_NAME.GUILD.CONFIG.CHANNEL.name,
                        description: 'Channel to apply the grant multiplier(not specified=default)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.CHANNEL_MULTIPLIER.name,
                        description: 'Grant multiplier for this channel(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG.REACTION.name,
                        description: 'Reaction that will grant reputation',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.REACTION_GRANT.name,
                        description: 'How much will be granted per reaction(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.REPLY_GRANT.name,
                        description: 'How much will be granted per reply(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        name: COMMANDS_NAME.GUILD.CONFIG.CHANNEL_PANTHEON.name,
                        description: 'Channels where reputation is granted to the people mentioned',
                    }, {
                        type: ApplicationCommandOptionTypes.BOOLEAN,
                        name: COMMANDS_NAME.GUILD.CONFIG.CHANNEL_PANTHEON_ENABLE.name,
                        description: 'Enable pantheon for this channel',
                    }, {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG.REACTION_ROLE_MESSAGE.name,
                        description: 'Set a role when react to this message(message url)',
                    }, {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG.REACTION_ROLE_REACTION.name,
                        description: 'Emoji to use to receive role',
                    }, {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG.REACTION_ROLE_ROLE.name,
                        description: 'Role to set when react(if not set remove previous role)',
                    }, {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG.REPUTATION_ROLE_ROLE.name,
                        description: 'Role to set when enough reputation',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG.REPUTATION_ROLE_MIN.name,
                        description: 'Min reputation to set role(if not set remove role)',
                    }
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.GUILD.CONFIG_2.name,
                description: 'Config guild(admin only)',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_START_PROPOSAL.name,
                        description: 'How much reputation to start a vote(0 = no vote)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_CONFIRM_PROPOSAL.name,
                        description: 'How much reputation to accept a proposal(0 = no vote)',
                    }, {
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.CHANNEL_PROPOSAL.name,
                        description: 'Where to post the proposal',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_MUTE.name,
                        description: 'How much reputation to mute someone(0 = no mute)',
                    }, {
                        type: ApplicationCommandOptionTypes.USER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.BLACKLIST_USER.name,
                        description: 'A user who will never be included in the system.',
                    }, {
                        type: ApplicationCommandOptionTypes.BOOLEAN,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.BLACKLIST_USER_ENABLE.name,
                        description: 'Add/remove this user from blacklist',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.POH_VOUCHERS_REWARD.name,
                        description: 'The amount of reputation rewarded to the voucher',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.MIN_REPUTATION_IGNORE.name,
                        description: 'Minimum reputation to ignore a message(0 = ignore feature disabled)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_REPUTATION.name,
                        description: 'Minimum reputation to transfer a message(0 = no transfer)',
                    }, {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_REACTION.name,
                        description: 'Reaction to transfer a message',
                    }, {
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_CHANNEL.name,
                        description: 'Destination to transfer a message',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_OVERRIDE_REPUTATION.name,
                        description: 'Override the minimum reputation to transfer a message',
                    }, {
                        type: ApplicationCommandOptionTypes.BOOLEAN,
                        name: COMMANDS_NAME.GUILD.CONFIG_2.REACTION_TRANSFER_DELETE.name,
                        description: 'Whether the original message should be deleted after transfer (defaults to true)',
                    }
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.name,
                description: 'Config guild Twitter (admin only). This feature allows content curation for Twitter posts.',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.TWITTER_ADMIN_ROLE.name,
                        description: 'The Discord role of Twitter admins. They will be the only ones allowed to start a proposal.',
                    },
                    {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.TWITTER_MEMBER_ROLE.name,
                        description: 'The Discord role of Twitter members. .',
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.PROPOSAL_DURATION.name,
                        description: 'Proposal\'s duration in days(>0)',
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.MIN_REPUTATION_PROPOSAL.name,
                        description: 'How much reputation to validate a Twitter proposal (0 = no vote)',
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.MIN_IN_FAVOR_MEMBERS.name,
                        description: 'How much in favor members are required to post the content on Twitter',
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.ACCESS_TOKEN.name,
                        description: 'The access token that will be used to authenticate against the Twitter API v2',
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.REFRESH_TOKEN.name,
                        description: 'The refresh token that will be used to authenticate against the Twitter API v2',
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.OAUTH2_CLIENT_ID.name,
                        description: 'The oauth2 client id that will be used to authenticate against the Twitter API v2',
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.GUILD.CONFIG_TWITTER.OAUTH2_CLIENT_SECRET.name,
                        description: 'The oauth2 client secret that will be used to authenticate against the Twitter API v2',
                    }
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.GUILD.DB_URL.name,
                description: 'Show the URL of database',
            }
        ]
    },
    {
        name: COMMANDS_NAME.ROUND.name, description: 'Demeter round', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.ROUND.CONFIG.name,
                description: 'Config round(admin only)',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.ROUND_SHIFT.name,
                        description: 'How much round in the past(0=now)',
                    }, {
                        type: ApplicationCommandOptionTypes.BOOLEAN,
                        name: COMMANDS_NAME.ROUND.CONFIG.APPLY_GUILD_DEFAULT.name,
                        description: 'Apply guild default setting to this round',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.DEFAULT_REPUTATION.name,
                        description: 'Default Reputation for new member',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.DISCORD_MATCHING.name,
                        description: 'How much reputation to add to QR',
                    }, {
                        type: ApplicationCommandOptionTypes.INTEGER,
                        name: COMMANDS_NAME.ROUND.CONFIG.DURATION.name,
                        description: 'Duration of each round in days',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.MIN_DECAY.name,
                        description: 'Min reputation decay in percent at each round(eg: 0.01)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.MAX_DECAY.name,
                        description: 'Max reputation decay in percent at each round(eg: 0.01)',
                    }, {
                        type: ApplicationCommandOptionTypes.ROLE,
                        name: COMMANDS_NAME.ROUND.CONFIG.ROLE.name,
                        description: 'Role to apply the power multiplier(not specified=default)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.ROLE_MULTIPLIER.name,
                        description: 'Power multiplier for this role(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        name: COMMANDS_NAME.ROUND.CONFIG.CHANNEL.name,
                        description: 'Channel to apply the grant multiplier(not specified=default)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.CHANNEL_MULTIPLIER.name,
                        description: 'Grant multiplier for this channel(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.ROUND.CONFIG.REACTION.name,
                        description: 'Reaction that will grant reputation',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.REACTION_GRANT.name,
                        description: 'How much will be granted per reaction(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.ROUND.CONFIG.REPLY_GRANT.name,
                        description: 'How much will be granted per reply(>=0)',
                    }
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.ROUND.START_FIRST.name,
                description: 'Start the first round'
            }
        ]
    },
    {
        name: COMMANDS_NAME.USER.name, description: 'Demeter user', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.USER.CONFIG.name,
                description: 'Config user',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.BOOLEAN,
                        name: COMMANDS_NAME.USER.CONFIG.APPLY_GUILD_DEFAULT.name,
                        description: 'Apply guild default setting',
                    }, {
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        name: COMMANDS_NAME.USER.CONFIG.CHANNEL.name,
                        description: 'Channel to apply the grant multiplier(not specified=default)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.USER.CONFIG.CHANNEL_MULTIPLIER.name,
                        description: 'Grant multiplier for this channel(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.USER.CONFIG.REACTION.name,
                        description: 'Reaction that will grant reputation',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.USER.CONFIG.REACTION_GRANT.name,
                        description: 'How much will be granted per reaction(>=0)',
                    }, {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.USER.CONFIG.REPLY_GRANT.name,
                        description: 'How much will be granted per reply(>=0)',
                    }
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.USER.UNMUTE.name,
                description: 'Unmute a user(Admin only)',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: COMMANDS_NAME.USER.UNMUTE.USER.name,
                        description: 'User to unmute',
                        required: true
                    }
                ]
            },
        ]
    },
    {
        name: COMMANDS_NAME.REPUTATION.name, description: 'Demeter reputation', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.REPUTATION.TOP.name,
                description: 'Print top reputation members',
                options: [{
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: COMMANDS_NAME.REPUTATION.TOP.START.name,
                    description: 'Print top members starting from this position',
                }]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.REPUTATION.GRANT_LIST.name,
                description: 'Show list of grant sent/received for a member',
                options: [{
                    type: ApplicationCommandOptionTypes.USER,
                    name: COMMANDS_NAME.REPUTATION.GRANT_LIST.USER.name,
                    description: 'Member to show',
                }, {
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: COMMANDS_NAME.REPUTATION.GRANT_LIST.ROUND.name,
                    description: 'How much round in the past(0=now)',
                },]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.REPUTATION.GRANT_ADD.name,
                description: 'Grant more reputation to a member',
                options: [{
                    type: ApplicationCommandOptionTypes.USER,
                    name: COMMANDS_NAME.REPUTATION.GRANT_ADD.USER.name,
                    description: 'Member to grant reputation',
                }, {
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: COMMANDS_NAME.REPUTATION.GRANT_ADD.AMOUNT.name,
                    description: 'How much to add ?(Automatically modified to not exceed the max)',
                },]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.REPUTATION.GRANT_SET.name,
                description: 'Update how much granted to a member',
                options: [{
                    type: ApplicationCommandOptionTypes.USER,
                    name: COMMANDS_NAME.REPUTATION.GRANT_SET.USER.name,
                    description: 'Member to update grant reputation',
                }, {
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: COMMANDS_NAME.REPUTATION.GRANT_SET.AMOUNT.name,
                    description: 'How much to grant ?(Automatically modified to not exceed the max)',
                },]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.REPUTATION.FETCH_HISTORY.name,
                description: 'Reload and compute grant history(erase all rounds and reputation)',
                options: [{
                    type: ApplicationCommandOptionTypes.STRING,
                    name: COMMANDS_NAME.REPUTATION.FETCH_HISTORY.START_DATE.name,
                    description: 'Date of the first round(format: 31/01/2021)',
                    required: true,
                },]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.REPUTATION.RECOMPUTE_REPUTATION.name,
                description: 'Recompute grant history',
                options: [{
                    type: ApplicationCommandOptionTypes.BOOLEAN,
                    name: COMMANDS_NAME.REPUTATION.RECOMPUTE_REPUTATION.USE_GUILD_CONFIG.name,
                    description: 'Use current guild config',
                    required: true,
                },]
            },
        ]
    },
    {
        name: COMMANDS_NAME.BUTTON.name, description: 'Print button', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.BUTTON.CAPTCHA.name,
                description: 'Print captcha button',
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.BUTTON.GUILD_INFO.name,
                description: 'Print guild info button',
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.BUTTON.USER_INFO.name,
                description: 'Print user info button',
            },
        ]
    },
    {
        name: COMMANDS_NAME.PROPOSAL.name, description: 'Discord Proposal', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.PROPOSAL.START.name,
                description: 'Start a proposal',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.MESSAGE.name,
                        description: 'Proposal\'s message URL',
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionTypes.INTEGER,
                        name: COMMANDS_NAME.PROPOSAL.START.DURATION.name,
                        description: 'Proposal\'s duration in days(>0)',
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: COMMANDS_NAME.PROPOSAL.START.MINT_USER.name,
                        description: 'User to mint reputation'
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.PROPOSAL.START.MINT_AMOUNT.name,
                        description: 'How much reputation to mint(>0)'
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.ADDRESS.name,
                        description: 'The recipient address'
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.CHAIN.name,
                        description: 'The destination chain'
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.ASSET.name,
                        description: 'The asset to send'
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.PROPOSAL.START.ASSET_AMOUNT.name,
                        description: 'The amount of asset to send'
                    },
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.PROPOSAL.MUTE.name,
                description: 'Vote to mute someone',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: COMMANDS_NAME.PROPOSAL.MUTE.USER.name,
                        description: 'User to mute',
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionTypes.INTEGER,
                        name: COMMANDS_NAME.PROPOSAL.MUTE.DURATION.name,
                        description: 'How much minute to mute',
                        required: true
                    },
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.PROPOSAL.START.name,
                description: 'Start a proposal',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.MESSAGE.name,
                        description: 'Proposal\'s message URL',
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionTypes.INTEGER,
                        name: COMMANDS_NAME.PROPOSAL.START.DURATION.name,
                        description: 'Proposal\'s duration in days(>0)',
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: COMMANDS_NAME.PROPOSAL.START.MINT_USER.name,
                        description: 'User to mint reputation'
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.PROPOSAL.START.MINT_AMOUNT.name,
                        description: 'How much reputation to mint(>0)'
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.ADDRESS.name,
                        description: 'The recipient address'
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.CHAIN.name,
                        description: 'The destination chain'
                    },
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.PROPOSAL.START.ASSET.name,
                        description: 'The asset to send'
                    },
                    {
                        type: ApplicationCommandOptionTypes.NUMBER,
                        name: COMMANDS_NAME.PROPOSAL.START.ASSET_AMOUNT.name,
                        description: 'The amount of asset to send'
                    },
                ]
            },
        ]
    },
    {
        name: COMMANDS_NAME.GIVEAWAY.name, description: 'Discord Giveaway', options: [
            {
                type: ApplicationCommandOptionTypes.STRING,
                name: COMMANDS_NAME.GIVEAWAY.MESSAGE.name,
                description: 'Message URL where people react',
                required: true
            },
            {
                type: ApplicationCommandOptionTypes.BOOLEAN,
                name: COMMANDS_NAME.GIVEAWAY.WEIGHTED.name,
                description: 'Weighted by reputation',
                required: true
            },
        ]
    },
    {
        name: COMMANDS_NAME.POH.name, description: 'Proof of Humanity', options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.POH.REGISTER.name,
                description: 'Register in the list of candidates',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.STRING,
                        name: COMMANDS_NAME.POH.REGISTER.PROFILE_URL.name,
                        description: 'The url of your PoH profile (https://app.proofofhumanity.id/profile/0x...)'
                    },
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.POH.UNREGISTER.name,
                description: 'Unregister from the list of candidates'
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.POH.LIST.name,
                description: 'Print the list of candidates'
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.POH.LIST_VOUCHED.name,
                description: 'Print the list of already vouched candidates'
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.POH.VOUCH.name,
                description: 'Vouch a candidate',
                options: [
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: COMMANDS_NAME.POH.VOUCH.USER.name,
                        description: 'The candidate to vouch'
                    },
                ]
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.POH.THANK_VOUCHER.name,
                description: 'Thank your voucher and unregister from the list of candidates'
            },
        ]
    },
    {
        name: COMMANDS_NAME.TWITTER_POST.name, type: 3
    },
    {
        name: COMMANDS_NAME.TREASURY.name,
        description: 'Manage the server treasury',
        options: [
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.TREASURY.DEPLOY.name,
                description: 'Deploy the treasury contract',
            },
            {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: COMMANDS_NAME.TREASURY.PRINT.name,
                description: 'Print the treasury assets',
            },
        ]
    }
]

/**
 *
 * @param interaction - Discord interaction
 * @param db - in-memory database
 * @param mutex - Mutex to access database safely
 * @param salt - Salt to generate a hash to hide the correct button
 * @param noiseImg - Jimp preloaded noise image
 * @param client - Discord Client
 * @returns {Promise<boolean>}
 */
const processCommand = async (interaction, db, mutex, salt, noiseImg, client) => {
    try {
        if (interaction.type === 2) return true

        await db.read()

        logger.debug('Get guild uuid...')
        const guildUuid = Object.keys(db?.data)
            ?.find(uuid => db?.data[uuid]?.guildDiscordId === interaction?.guildId)
        logger.debug('Get guild uuid done.')

        if (await processGuild(interaction, guildUuid, db, mutex)) return true
        if (await processRound(interaction, guildUuid, db, mutex)) return true
        if (await processUser(interaction, guildUuid, db, mutex)) return true
        if (await processGrant(interaction, guildUuid, db, mutex)) return true
        if (await processReputation(interaction, guildUuid, db, mutex)) return true
        if (await processPrintButton(interaction, guildUuid, db, mutex)) return true
        if (await processProposal(interaction, guildUuid, db, mutex)) return true
        if (await processGiveaway(interaction, guildUuid, db, mutex)) return true
        if (await processProofOfHumanity(interaction, guildUuid, db, mutex)) return true
        if (await processTwitter(interaction, guildUuid, db, mutex, client)) return true
        if (await processTreasury(interaction, guildUuid, db, mutex)) return true

        if (await processButton(interaction, guildUuid, db, mutex, salt, noiseImg)) return true

    } catch (e) {
        logger.error(e)
        await interaction.reply({content: 'Something went wrong...', ephemeral: true})
        return true
    }
}

/**
 * Create all commands
 * @param client - Client Discord
 * @param guildDiscordId - Discord guild id
 * @returns {Promise<void>}
 */
export const createCommand = async (client, guildDiscordId) => {
    try {
        for (const command of COMMANDS) {
            await client?.application?.commands
                ?.create(command, guildDiscordId)
                ?.catch((e) => {
                    logger.error(e)
                    logger.error(`Failed to create command for ${guildDiscordId}`)
                })
        }
    } catch (e) {
        logger.error(e)
    }
}

/**
 * Delete all commands
 * @param client - Client Discord
 * @param guildDiscordId - Discord guild id
 * @returns {Promise<void>}
 */
export const deleteCommands = async (client, guildDiscordId) => {
    try {
        const commands = await client?.application?.commands
            ?.fetch()
            ?.catch(() => {
                logger.error('Failed to retrieve command.')
                return new Collection()
            })

        commands.each(async (command) => await command
            ?.delete()
            ?.catch(() => logger.error(`Failed to remove command for ${guildDiscordId}`)))
    } catch (e) {
        logger.error(e)
    }
}


export default processCommand
