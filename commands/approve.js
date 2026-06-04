// commands/approve.js
// @cat: gc-menu

export default async function approveCommand(client, message, args) {
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

    try {
        // Récupère les demandes en attente
        const requests = await client.groupRequestParticipantsList(remoteJid)

        if (!requests || requests.length === 0) {
            return client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📋 AUCUNE DEMANDE*
*┊En attente : 0*
┊
╰─────────────────❂`
            }, { quoted: message })
        }

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⏳ APPROBATION EN COURS...*
*┊📋 ${requests.length} demande(s) trouvée(s)*
┊
╰─────────────────❂`
        }, { quoted: message })

        // Approuve toutes les demandes
        const jids = requests.map(r => r.jid)
        await client.groupRequestParticipantsUpdate(remoteJid, jids, 'approve')

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ DEMANDES APPROUVÉES !*
┊
*┊👥 ${requests.length} membre(s) ajouté(s)*
┊
╰─────────────────❂`
        }, { quoted: message })

    } catch (err) {
        console.error('❌ approve:', err.message)

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
