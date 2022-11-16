import {COMMANDS_NAME} from "../index.js";
import logger from "../../../core/winston/index.js";
import {configGuild} from "./configGuild/index.js";
import {retrieveLastUploadCid} from "../../../core/ipfs/index.js";

/**
 * Get the last database saved and return link to the json guild
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @returns {Promise<boolean>}
 */
const printDbUrl = async (interaction, guildUuid) => {
    try {
        if (!interaction?.options?.data
            ?.find(d => d?.name === COMMANDS_NAME.GUILD.DB_URL.name)) return false

        await interaction?.deferReply({ ephemeral: true })
            ?.catch(() => logger.error('Defer reply interaction failed.'))
        const lastUploadCid = await retrieveLastUploadCid(false)
        await interaction
            ?.editReply({content: `https://${lastUploadCid}.ipfs.dweb.link/${guildUuid}.json`, ephemeral: true})
            ?.catch(() => logger.error('Edit reply interaction failed.'))

        return true
    } catch (e) {
        logger.error(e)
        await interaction
            ?.editReply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Edit reply interaction failed.'))
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
export const processGuild = async (interaction, guildUuid, db, mutex) => {
    try {
        if (interaction?.commandName !== COMMANDS_NAME.GUILD.name) return false

        if (await printDbUrl(interaction, guildUuid)) return true
        if (await configGuild(interaction, guildUuid, db, mutex)) return true

        return true
    } catch (e) {
        logger.error(e)
        await interaction
            ?.reply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    }
}
