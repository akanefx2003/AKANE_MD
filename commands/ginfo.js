// commands/ginfo.js
// @cat: gc-menu

export default async function ginfoCommand(client, message, args) {
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
        const meta = await client.groupMetadata(remoteJid)

        const name        = meta.subject || 'N/A'
        const desc        = meta.desc || 'Aucune description'
        const creation    = meta.creation
            ? new Date(meta.creation * 1000).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })
            : 'N/A'
        const owner       = meta.owner
            ? `@${meta.owner.split('@')[0]}`
            : 'N/A'
        const ownerJid    = meta.owner ? [meta.owner] : []
        const total       = meta.participants?.length || 0
        const admins      = meta.participants?.filter(p => p.admin).length || 0
        const members     = total - admins
        const invite      = await client.groupInviteCode(remoteJid).catch(() => null)
        const inviteLink  = invite ? `https://chat.whatsapp.com/${invite}` : 'N/A'

        // Paramètres du groupe
        const isLocked    = meta.announce ? '🔒 Admins seulement' : '🔓 Tous les membres'
        const isRestrict  = meta.restrict  ? '🔒 Admins seulement' : '🔓 Tous les membres'
        const ephemeral   = meta.ephemeralDuration
            ? `⏱️ ${meta.ephemeralDuration / 86400}j`
            : '❌ Désactivé'
        const joinApproval = meta.joinApprovalMode ? '✅ Activé' : '❌ Désactivé'
        const memberAdd    = meta.memberAddMode === 'admin_add'
            ? '🔒 Admins seulement'
            : '🔓 Tous les membres'

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📋 INFOS DU GROUPE*
┊
*┊📌 NOM :*
*┊${name}*
┊
*┊📝 DESCRIPTION :*
*┊${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}*
┊
*┊👑 CRÉATEUR : ${owner}*
*┊📅 CRÉÉ LE : ${creation}*
*┊🆔 JID : ${remoteJid}*
┊
*┊👥 MEMBRES : ${total}*
*┊👑 ADMINS : ${admins}*
┊
*┊🔗 LIEN :*
*┊${inviteLink}*
┊
╰─────────────────❂`,
            mentions: ownerJid,
            nativeFlow: invite ? [{
                text: '🔗 REJOINDRE LE GROUPE',
                url: inviteLink
            }] : []
        }, { quoted: message })

    } catch (err) {
        console.error('❌ ginfo:', err.message)
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${err.message}*
┊
╰─────────────────❂`
        }, { quoted: message })
    }
}
