// commands/setgpp.js
// @cat: gc-menu

import { downloadMediaMessage } from '@crysnovax/baileys'

export default async function setgppCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ GROUPE UNIQUEMENT !*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    const contextInfo = message.message?.extendedTextMessage?.contextInfo
    const quotedMsg   = contextInfo?.quotedMessage
    const quotedType  = quotedMsg ? Object.keys(quotedMsg)[0] : null

    if (quotedType !== 'imageMessage') {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📝 UTILISATION :*
*┊Cite une image puis tape .setgpp*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    try {
        await client.sendMessage(remoteJid, {
            text: '⏳ *Changement en cours...*'
        }, { quoted: message })

        // Reconstruit le message cité exactement comme gstatus
        const fakeMessage = {
            key: {
                remoteJid,
                fromMe: contextInfo.participant === client.user?.id?.split(':')[0] + '@s.whatsapp.net',
                id: contextInfo.stanzaId,
                participant: contextInfo.participant
            },
            message: quotedMsg
        }

        const buffer = await downloadMediaMessage(
            fakeMessage,
            'buffer',
            {},
            {
                logger: { info: () => {}, error: () => {}, debug: () => {}, warn: () => {} },
                reuploadRequest: client.updateMediaMessage
            }
        )

        if (!buffer) throw new Error('Buffer vide')

        await client.updateProfilePicture(remoteJid, buffer)

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ PHOTO DE GROUPE CHANGÉE !*
┊
╰─────────────────❂`
        }, { quoted: message })

    } catch (err) {
        console.error('❌ setgpp:', err.message)

        let raison = err.message
        if (err.message.includes('not-authorized')) raison = 'Bot non admin'
        if (err.message.includes('bad-image'))      raison = 'Image invalide'

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${raison}*
┊
╰─────────────────❂`
        }, { quoted: message })
    }
}
