// commands/setgdesc.js
// @cat: gc-menu

export default async function setgdescCommand(client, message, args) {
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

    const newDesc = args.join(' ').trim()

    if (!newDesc) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📝 UTILISATION :*
*┊.setgdesc [DESCRIPTION]*
┊
*┊💡 EXEMPLE :*
*┊.setgdesc Bienvenue sur notre groupe !*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    try {
        await client.groupUpdateDescription(remoteJid, newDesc)

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ DESCRIPTION CHANGÉE !*
┊
*┊📋 ${newDesc.substring(0, 60)}${newDesc.length > 60 ? '...' : ''}*
┊
╰─────────────────❂`
        }, { quoted: message })

    } catch (err) {
        console.error('❌ setgdesc:', err.message)

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
