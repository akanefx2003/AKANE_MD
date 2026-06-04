// commands/groupcreate.js
// @cat: gc-menu

export default async function groupCreateCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    const query     = args.join(' ').trim()

    // AIDE
    if (!query) {
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊👥 CRÉER UN GROUPE*
┊
*┊📝 UTILISATION :*
*┊.groupcreate [NOM]*
┊
*┊💡 EXEMPLE :*
*┊.groupcreate Mon Groupe*
┊
╰─────────────────❂`
        }, { quoted: message })
        return
    }

    // Récupère les mentions (@tag dans le message)
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
                   || message.message?.conversation?.mentionedJid
                   || []

    // Si pas de mention, ajoute quand même le bot lui-même
    const participants = mentioned.length > 0
        ? mentioned
        : []

    try {
        await client.sendMessage(remoteJid, {
            text: '⏳ *Création du groupe...*'
        }, { quoted: message })

        const group = await client.groupCreate(query, participants)
        const jid   = group.gid || group.id

        const inviteCode = await client.groupInviteCode(jid)
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`

        // Mentions pour le message de confirmation
        const mentionList = participants.length > 0 ? participants : []
        const membersText = mentionList.length > 0
            ? mentionList.map(j => `@${j.split('@')[0]}`).join(', ')
            : 'Aucun membre ajouté'

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ GROUPE CRÉÉ !*
┊
*┊👥 NOM : ${query}*
*┊👤 MEMBRES : ${membersText}*
*┊🔗 LIEN :*
*┊${inviteLink}*
┊
╰─────────────────❂`,
            mentions: mentionList
        }, { quoted: message })

    } catch (err) {
        console.error('❌ groupcreate:', err.message)

        let raison = err.message
        if (err.message.includes('not-authorized')) raison = 'Non autorisé'
        if (err.message.includes('rate-overlimit')) raison = 'Trop de groupes créés récemment'

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
