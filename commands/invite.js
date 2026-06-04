// commands/invite.js
// @cat: gc-menu

async function invite(client, message) {

    const remoteJid = message.key.remoteJid

    if (!remoteJid.endsWith('@g.us')) {
        return await client.sendMessage(remoteJid, {
            text:
`*GROUPE UNIQUEMENT !*`
        })
    }

    try {
        const meta      = await client.groupMetadata(remoteJid)
        const groupName = meta.subject

        let inviteCode
        try {
            inviteCode = await client.groupInviteCode(remoteJid)
        } catch {
            return await client.sendMessage(remoteJid, {
                text:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊❌ DROITS ADMIN REQUIS CONNARDS*
┊
*┊⚠️ J'AI BESOIN D'ÊTRE ADMIN*
*┊POUR GÉNÉRER LE LIEN*
┊
╰─────────────────❂`
            })
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD - INVITE*
┊
*┊👥 GROUPE : ${groupName.toUpperCase()}*
┊
*┊🔗 LIEN D'INVITATION :*
┊
╰─────────────────`,
            nativeFlow: [
                {
                    text: '👥 REJOINDRE LE GROUPE',
                    url: inviteLink
                },
                {
                    text: '📋 COPIER LE LIEN',
                    copy: inviteLink
                }
            ]
        }, { quoted: message })

    } catch (e) {
        console.error('GLINK ERROR:', e)
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${e.message.toUpperCase()}*
┊
╰─────────────────❂`
        })
    }
}

export default invite
