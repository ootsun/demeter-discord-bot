import logger from "../../../core/winston/index.js";
import {
    DaoCreationSteps,
    TokenVotingClient,
    VotingMode
} from "@aragon/sdk-client";
import {aragonClient} from "../../../core/aragon/aragon-client-provider.js";

export const processDao = async (interaction, guildUuid, db, mutex) => {
    try {
        if (interaction?.commandName !== 'dao') return false

        if (!guildUuid) return true

        if(await create(interaction, guildUuid, db, mutex)) return true

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

const create = async (interaction, guildUuid, db, mutex) => {
    try {
        const command = interaction?.options?.data
            ?.find(d => d?.name === 'create')
        if (!command) return false

        logger.debug('Create DAO...')

        await interaction.deferReply({ephemeral: true})
        const name = interaction.options.getString('name')
        const metadata = {
            name: name,
            description: "DAO created with Daoscord",
            avatar: "https://img.freepik.com/vecteurs-premium/deesse-demeter_175624-68.jpg?w=826",
            links: [{
                name: "Github repository",
                url: "https://github.com/challet/daoscord",
            }],
        };
        // const metadataUri = await aragonClient.methods.pinMetadata(metadata);
        const metadataUri = ''
        const tokenVotingPluginInstallParams = {
            votingSettings: {
                minDuration: 60, // seconds
                minParticipation: 0.25, // 25%
                supportThreshold: 0.5, // 50%
                minProposerVotingPower: BigInt("1"), // default 0
                votingMode: VotingMode.EARLY_EXECUTION, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
            },
            useToken: {
                tokenAddress: await deployToken(),
                wrappedToken: {
                    name: 'DeFi France',
                    symbol: 'DFF'
                }
            }
        };

        const tokenVotingInstallItem = TokenVotingClient.encoding
            .getPluginInstallItem(tokenVotingPluginInstallParams);

        const createDaoParams = {
            metadataUri,
            ensSubdomain: "defi-france.eth",
            plugins: [tokenVotingInstallItem], // plugin array cannot be empty or the transaction will fail. you need at least one governance mechanism to create your DAO.
        };

        const steps = aragonClient.methods.createDao(createDaoParams);
        for await (const step of steps) {
            try {
                switch (step.key) {
                    case DaoCreationSteps.CREATING:
                        console.log({txHash: step.txHash});
                        break;
                    case DaoCreationSteps.DONE:
                        console.log({
                            daoAddress: step.address,
                            pluginAddresses: step.pluginAddresses,
                        });
                        await mutex.runExclusive(async () => {
                            db.data[guildUuid].daoAddress = step.address
                            db.data[guildUuid].tokenVotingPluginAddress = step.pluginAddresses[0]
                        })
                        await interaction.reply(`Created DAO at ${step.address}!`)
                        break;
                }
            } catch (err) {
                console.error(err);
            }
        }
        await db.write()

        logger.debug('Create DAO done.')

        await interaction
            ?.reply({content: 'Done !', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}

const deployToken = async () => {
    //TODO: Implement
    return "TODO: Implement"
}