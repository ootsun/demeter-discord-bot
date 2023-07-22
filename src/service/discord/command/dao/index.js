import logger from "../../../core/winston/index.js";

export const processDao = async (interaction, guildUuid, db, mutex, daoscordClient) => {
    try {
        if (interaction?.commandName !== 'dao') return false

        if (!guildUuid) return true

        if(await create(interaction, guildUuid, db, mutex, daoscordClient)) return true

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

const create = async (interaction, guildUuid, db, mutex, daoscordClient) => {
    try {
        const command = interaction?.options?.data
            ?.find(d => d?.name === 'create')
        if (!command) return false

        logger.debug('Create DAO...')

        await interaction.deferReply({ephemeral: true})
        const daoAddress = await daoscordClient.createDao()
        await interaction.editReply(`Congrats! Created the DAO at ${daoAddress}`)

        logger.debug('Create DAO done.')
        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}