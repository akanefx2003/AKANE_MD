// commands/kick.js
// @cat: gc-menu

export default async function kickCommand(client, message, args) {
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

    // Récupère les cibles — mention ou citation
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted    = message.message?.extendedTextMessage?.contextInfo?.participant
    const targets   = [...mentioned]
    if (quoted && !targets.includes(quoted)) targets.push(quoted)

    if (!targets.length) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📝 UTILISATION :*
*┊.kick @mention*
*┊ou cite un message*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    // Empêche de kick le bot lui-même
    const botNumber = client.user?.id?.split(':')[0].split('@')[0]
    const filtered  = targets.filter(j => !j.includes(botNumber))

    if (!filtered.length) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ JE NE PEUX PAS ME KICK !*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    try {
        await client.groupParticipantsUpdate(remoteJid, filtered, 'remove')

        const names = filtered.map(j => `@${j.split('@')[0]}`).join(', ')

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ EXPULSÉ(S) !*
┊
*┊🚪 ${names}*
┊
╰─────────────────❂`,
            mentions: filtered
        }, { quoted: message })

    } catch (err) {
        console.error('❌ kick:', err.message)

        let raison = err.message
        if (err.message.includes('not-authorized')) raison = 'Bot non admin'

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
