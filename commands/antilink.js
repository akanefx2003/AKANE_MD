// commands/antilink.js
// @cat: gc-menu

const antilinkSettings = {};

// ✅ Fonction au lieu de constante pour éviter le bug du flag 'g'
function hasLink(text) {
    return /((https?:\/\/)|(www\.))(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$?!:,.])/i.test(text);
}

export default async function antilinkCommand(client, message, args) {
    const jid = message.key.remoteJid;
    if (!jid.endsWith('@g.us')) return;

    const metadata = await client.groupMetadata(jid);
    const sender = message.key.participant || jid;
    const isAdmin = metadata.participants.filter(p => p.admin).some(p => p.id === sender);
    if (!isAdmin) return client.sendMessage(jid, { text:
`❌ *Admins uniquement !*

> *© AKANE MD 🌹*` });

    const query = args[0]?.toLowerCase();

    // ========== RESET CASIER ==========
    if (query === 'reset') {
        const target = message.message?.extendedTextMessage?.contextInfo?.participant
            || (args[1]?.replace(/[^0-9]/g, '') ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

        if (!target) {
            return client.sendMessage(jid, { text:
`﹝╎🔗 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

💡 *Comment reset un casier :*

⸙﹝ Cite le message de la personne + antilink reset ﹞✴︎
⸙﹝ antilink reset 221XXXXXXXXX ﹞✴︎

> *© AKANE MD 🌹*` })
        }

        if (antilinkSettings[jid]?.warns?.[target]) {
            delete antilinkSettings[jid].warns[target]
            return client.sendMessage(jid, {
                text:
`﹝╎🔗 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

✅ *Casier effacé !*

⸙﹝ @${target.split('@')[0]} repart à 0/3 ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`,
                mentions: [target]
            })
        } else {
            return client.sendMessage(jid, { text:
`⸙﹝ Cette personne n'a aucun avertissement ﹞✴︎

> *© AKANE MD 🌹*` })
        }
    }

    // ========== OFF ==========
    if (query === 'off') {
        delete antilinkSettings[jid];
        return client.sendMessage(jid, { text:
`﹝╎🔗 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

🔴 *Antilink désactivé !*

> *© AKANE MD 🌹*` });
    }

    // ========== ON / DIRECT ==========
    const mode = query === 'direct' ? 'direct' : 'warn'
    antilinkSettings[jid] = { mode, warns: {} };

    return client.sendMessage(jid, { text:
`﹝╎🔗 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

🟢 *Antilink activé !*

⋆.˚⪩ 𝐌𝐨𝐝𝐞 ⪨
⸙﹝ ${mode === 'direct' ? '⚡ Direct (kick immédiat)' : '⚠️ Warn (kick à 3 avertissements)'} ﹞✴︎

⋆.˚⪩ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬 ⪨
⸙﹝ antilink off → désactiver ﹞✴︎
⸙﹝ antilink direct → kick direct ﹞✴︎
⸙﹝ antilink warn → 3 avertissements ﹞✴︎
⸙﹝ antilink reset @mention → effacer casier ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` });
}

export async function handleAntilink(client, message) {
    const jid = message.key.remoteJid;
    if (!jid?.endsWith('@g.us') || !antilinkSettings[jid]) return false;

    // Ignorer les messages du bot lui-même
    if (message.key.fromMe) return false;

    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    
    // ✅ Nouveau regex créé à chaque appel — plus de bug lastIndex
    if (!hasLink(text)) return false;

    const sender = message.key.participant || jid;

    // ✅ Vérifier admin AVANT de supprimer
    const metadata = await client.groupMetadata(jid);
    const isAdmin = metadata.participants.filter(p => p.admin).some(p => p.id === sender);
    if (isAdmin) return false;

    // Supprimer le message
    await client.sendMessage(jid, { delete: message.key });

    if (antilinkSettings[jid].mode === 'direct') {
        await client.groupParticipantsUpdate(jid, [sender], 'remove');
        await client.sendMessage(jid, {
            text: `⚡ *@${sender.split('@')[0]} a été expulsé pour avoir envoyé un lien !*`,
            mentions: [sender]
        });
    } else {
        let userWarns = (antilinkSettings[jid].warns[sender] || 0) + 1;
        antilinkSettings[jid].warns[sender] = userWarns;

        if (userWarns < 3) {
            await client.sendMessage(jid, {
                text:
`⚠️ *@${sender.split('@')[0]}* arrête d'envoyer des liens ! *(${userWarns}/3)*

⸙﹝ Encore ${3 - userWarns} avertissement(s) avant le kick ﹞✴︎

> *© AKANE MD 🌹*`,
                mentions: [sender]
            });
        } else {
            await client.groupParticipantsUpdate(jid, [sender], 'remove');
            delete antilinkSettings[jid].warns[sender];
            await client.sendMessage(jid, {
                text: `🚫 *@${sender.split('@')[0]} a été expulsé après 3 avertissements !*`,
                mentions: [sender]
            });
        }
    }
    return true;
}
