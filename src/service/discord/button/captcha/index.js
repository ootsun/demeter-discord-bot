import Jimp from 'jimp'
import fs from 'fs'
import {MessageActionRow, MessageButton} from 'discord.js'
import crypto from 'crypto'
import {v4 as uuidv4} from 'uuid'
import logger from '../../../core/winston/index.js'

const fsPromises = fs.promises

const BUTTON_CAPTCHA = {
    VERIFY: {customId: 'VERIFY', label: '🤖 Verify me', style: 'PRIMARY'},
}

export const captchaComponents = [new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId(BUTTON_CAPTCHA.VERIFY.customId)
            .setLabel(BUTTON_CAPTCHA.VERIFY.label)
            .setStyle(BUTTON_CAPTCHA.VERIFY.style),
    )]

/**
 * Generate a captcha image with 3 emoji and a LOT of noise, user need to clic on the matching emoji button(3 time)
 * @param interaction - Discord interaction
 * @param failed - true if user failed to solve a previous captcha, will reset salt
 * @param noiseImg - Jimp preloaded noise image
 * @param salt - Salt to generate a hash to hide the correct button
 * @param successQty - How much success captcha solved
 * @param skipCheck - Skip check of interaction.customId, used when not the first captcha to solve
 * @param captchaSteps - Number of required captcha steps
 * @returns {Promise<boolean>}
 */
const printCaptchaImage = async (interaction, failed, salt, noiseImg, successQty, skipCheck, captchaSteps) => {
    try {
        if (!skipCheck && !failed && interaction.customId !== BUTTON_CAPTCHA.VERIFY.customId) return false

        await interaction?.deferReply()
        salt[interaction.member.id] = uuidv4()
        let emojiSimpleList = await fsPromises.readdir('./images/emoji')
        emojiSimpleList = emojiSimpleList.filter(p => !p.includes('-'))
        // [min -> ]max
        const rng = (min, max) => {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor(Math.random() * (max - min)) + min
        }
        let oldPosition = []

        logger.debug('Put 3 visible emoji...')
        const emojiPath = Array(3)
            .fill('')
            .map(() => emojiSimpleList[rng(0, emojiSimpleList.length)])
        emojiSimpleList = emojiSimpleList
            .filter(p => !emojiPath.includes(p))
        let captchaImg = await new Jimp(600, 300, 'white')

        for (const path of emojiPath) {
            let emoji = await Jimp.read('./images/emoji/' + path)
            if (rng(0, 2)) emoji = await emoji.flip(true, false)
            if (rng(0, 2)) emoji = await emoji.flip(false, true)
            if (rng(0, 2)) emoji = await emoji.resize(rng(30, 120), 72)
            else emoji = await emoji.resize(72, rng(30, 120))
            emoji = await emoji.pixelate(rng(3, 5))
            emoji = await emoji.rotate(rng(0, 90))
            emoji = await emoji.color([
                {apply: 'mix', params: ['red', rng(0, 20)]},
                {apply: 'hue', params: [rng(-260, 260)]},
                {apply: 'mix', params: ['green', rng(0, 20)]},
                {apply: 'hue', params: [rng(-260, 260)]},
                {apply: 'mix', params: ['blue', rng(0, 20)]},
                {apply: 'hue', params: [rng(-260, 260)]},
            ])
            let pos = [rng(0, 540), rng(0, 200)]
            do {
                pos = [rng(0, 540), rng(0, 200)]
            } while (oldPosition.find(p => Math.abs(p[0] - pos[0]) + Math.abs(p[1] - pos[1]) < 150))
            oldPosition.push(pos)
            captchaImg = await captchaImg.composite(emoji, pos[0], pos[1])
        }
        logger.debug('Put 3 visible emoji done.')

        logger.debug('Noise...')
        captchaImg = await captchaImg.composite(noiseImg, -rng(200, 400), -rng(200, 400))
        logger.debug('Noise done.')

        logger.debug('Shuffle button...')
        const buttonList = [
            new MessageButton()
                .setCustomId(`captcha-${crypto.createHash('sha256')
                    .update(`${salt[interaction.member.id]}true${successQty}`)
                    .digest('hex')}`)
                .setStyle('PRIMARY')
                .setLabel(String.fromCodePoint(parseInt(emojiPath[rng(0, 3)]
                    .replace('.png', ''), 16))),
            ...Array(8)
                .fill(0)
                .map((_, i) => new MessageButton()
                    .setCustomId(`captcha-${crypto
                        .createHash('sha256')
                        .update(`${salt[interaction.member.id]}${i}false`)
                        .digest('hex')}`)
                    .setStyle('PRIMARY')
                    .setLabel(String.fromCodePoint(parseInt(emojiSimpleList[rng(0, emojiSimpleList.length)]
                        .replace('.png', ''), 16))))
        ].sort(() => 0.5 - Math.random())
        logger.debug('Shuffle button done.')

        const buffer = await new Promise((res) => captchaImg
            .getBuffer(Jimp.MIME_JPEG, (err, buffer) => res(buffer)))
        await interaction
            ?.editReply({
                content: failed ? 'Try again...\n\n' : '' + `Please select the emoji you see in the image ${captchaSteps > 1 ? `(${successQty+1}/${captchaSteps})` : ''}:`,
                ephemeral: true,
                files: [buffer],
                components: [
                    new MessageActionRow().addComponents(buttonList[0]).addComponents(buttonList[1]).addComponents(buttonList[2]),
                    new MessageActionRow().addComponents(buttonList[3]).addComponents(buttonList[4]).addComponents(buttonList[5]),
                    new MessageActionRow().addComponents(buttonList[6]).addComponents(buttonList[7]).addComponents(buttonList[8]),
                ]
            })
            ?.catch(() => logger.error('Reply interaction failed.'))

        return true
    } catch (e) {
        logger.error(e)
        await interaction
            ?.editReply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    }
}

/**
 * Add captcha role to user
 * @param interaction - Discord interaction
 * @param guildDb - In-memory database
 * @returns {Promise<boolean>}
 */
async function addCaptchaRole(interaction, guildDb) {
    await interaction
      ?.reply({
          content: 'Well done!\n' +
            'You are now verified.', components: [], files: [], ephemeral: true
      })
      ?.catch(() => logger.error('Reply interaction failed.'))

    logger.debug('Add captcha role to user...')
    if (guildDb.config.captchaRole) await interaction.member.roles
      .add(guildDb.config.captchaRole)
      .catch((e) => {
          logger.error('Failed to add role captcha');
          console.log(e);
      })
    logger.debug('Add captcha role to user done.')
}

/**
 * Check if the emoji selected by the user is the good one, and ask new one or apply captcha role if 3 done
 * @param interaction - Discord interaction
 * @param salt - Salt to generate a hash to hide the correct button
 * @param noiseImg - Jimp preloaded noise image
 * @param guildDb - In-memory database
 * @returns {Promise<boolean>}
 */
const testCaptcha = async (interaction, salt, noiseImg, guildDb) => {
    try {
        if (!interaction.customId.startsWith('captcha-')) return false

        switch (interaction.customId) {
            case `captcha-${crypto
                .createHash('sha256')
                .update(salt[interaction.member.id] + 'true0')
                .digest('hex')}`:
                if(guildDb.config.captchaSteps === 1) {
                    await addCaptchaRole(interaction, guildDb)
                } else {
                    await printCaptchaImage(interaction, false, salt, noiseImg, 1, true, guildDb.config.captchaSteps)
                }
                break
            case `captcha-${crypto
                .createHash('sha256')
                .update(salt[interaction.member.id] + 'true1')
                .digest('hex')}`:
                if(guildDb.config.captchaSteps === 2) {
                    await addCaptchaRole(interaction, guildDb)
                } else {
                    await printCaptchaImage(interaction, false, salt, noiseImg, 2, true, guildDb.config.captchaSteps)
                }
                break
            case `captcha-${crypto
                .createHash('sha256')
                .update(salt[interaction.member.id] + 'true2')
                .digest('hex')}`:

                await addCaptchaRole(interaction, guildDb);

                break
            default:
                await printCaptchaImage(interaction, true, salt, noiseImg, 0, false, guildDb.config.captchaSteps)
                break
        }

        return true
    } catch (e) {
        logger.error(e)
        await interaction
            ?.reply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    }
}

/**
 *
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - In-memory database
 * @param salt - Salt to generate a hash to hide the correct button
 * @param noiseImg - Jimp preloaded noise image
 * @returns {Promise<boolean>}
 */
export const printCaptcha = async (interaction, guildUuid, db, salt, noiseImg) => {
    try {
        const guildDb = db.data[guildUuid]

        if (await printCaptchaImage(interaction, false, salt, noiseImg, 0, false, guildDb.config.captchaSteps)) return true
        if (await testCaptcha(interaction, salt, noiseImg, guildDb)) return true

        return false
    } catch (e) {
        logger.error(e)
        await interaction
            ?.reply({content: 'Something went wrong...', ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
        return true
    }
}
