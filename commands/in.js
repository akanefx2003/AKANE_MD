// commands/invite.js

async function invite(client, message) {

    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid.endsWith('@g.us');

    if (!isGroup) {
        return await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊❌ GROUPE UNIQUEMENT !*
┊
╰───────────────────❂`
        });
    }

    try {
        const meta = await client.groupMetadata(remoteJid);
        const groupName = meta.subject;

        let inviteCode;
        try {
            inviteCode = await client.groupInviteCode(remoteJid);
        } catch (err) {
            return await client.sendMessage(remoteJid, {
                text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊❌ DROITS ADMIN REQUIS*
┊
*┊⚠️ J'AI BESOIN D'ETRE ADMIN POUR GENERER LE LIEN*
┊
╰───────────────────❂`
            });
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        let thumbnail = null;
        try {
            const pp = await client.profilePictureUrl(remoteJid, 'image');
            const res = await fetch(pp);
            const buf = await res.arrayBuffer();
            thumbnail = Buffer.from(buf);
        } catch (_) {}

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD - INVITE*
┊
*┊👥 GROUPE : ${groupName.toUpperCase()}*
┊
*┊🔗 LIEN :*
*┊${inviteLink}*
┊
╰───────────────────❂`,
            linkPreview: false
        });

    } catch (e) {
        console.error('GLINK ERROR:', e);
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${e.message.toUpperCase()}*
┊
╰───────────────────❂`
        });
    }
}

export default invite;
