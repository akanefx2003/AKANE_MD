const antilinkSettings = {}; 
const LINK_REGEX = /((https?:\/\/)|(www\.))(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$?!:,.])/gi;

export default async function antilinkCommand(client, message, args) {
    const jid = message.key.remoteJid;
    if (!jid.endsWith('@g.us')) return;
    const metadata = await client.groupMetadata(jid);
    const sender = message.key.participant || jid;
    const isAdmin = metadata.participants.filter(p => p.admin).some(p => p.id === sender);
    if (!isAdmin) return client.sendMessage(jid, { text: '❌ *Admin uniquement*' });

    const query = args[0]?.toLowerCase();
    if (query === 'off') {
        delete antilinkSettings[jid];
        return client.sendMessage(jid, { text: '🔴 *Antilink désactivé.*' });
    }
    
    antilinkSettings[jid] = { mode: query === 'direct' ? 'direct' : 'warn', warns: {} };
    return client.sendMessage(jid, { text: `🟢 *Antilink activé en mode ${antilinkSettings[jid].mode} !*` });
}

export async function handleAntilink(client, message) {
    const jid = message.key.remoteJid;
    if (!jid?.endsWith('@g.us') || !antilinkSettings[jid]) return false;

    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    if (!LINK_REGEX.test(text)) return false;

    const sender = message.key.participant || jid;
    const metadata = await client.groupMetadata(jid);
    if (metadata.participants.filter(p => p.admin).some(p => p.id === sender)) return false;

    await client.sendMessage(jid, { delete: message.key });

    if (antilinkSettings[jid].mode === 'direct') {
        await client.groupParticipantsUpdate(jid, [sender], 'remove');
    } else {
        let userWarns = (antilinkSettings[jid].warns[sender] || 0) + 1;
        antilinkSettings[jid].warns[sender] = userWarns;

        if (userWarns < 3) {
            await client.sendMessage(jid, { 
                text: `⚠️ *@${sender.split('@')[0]} arrete d’envoyé des lien dans le groupe connards* (${userWarns}/3)`,
                mentions: [sender]
            });
        } else {
            await client.groupParticipantsUpdate(jid, [sender], 'remove');
            delete antilinkSettings[jid].warns[sender];
        }
    }
    return true;
}
