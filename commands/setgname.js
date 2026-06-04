// commands/setgname.js
// @cat: gc-menu

export default async function setgnameCommand(client, message, args) {
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

    const newName = args.join(' ').trim()

    if (!newName) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📝 UTILISATION :*
*┊.setgname [NOM]*
┊
*┊💡 EXEMPLE :*
*┊.setgname Mon Groupe 🔥*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    try {
        await client.groupUpdateSubject(remoteJid, newName)

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ NOM CHANGÉ !*
┊
*┊📌 ${newName}*
┊
╰─────────────────❂`
        }, { quoted: message })

    } catch (err) {
        console.error('❌ setgname:', err.message)

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
