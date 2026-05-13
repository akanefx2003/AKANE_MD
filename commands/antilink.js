// antilink.js - Gestion des liens avec modes et avertissements
const antilinkSettings = {}; // Stockage : { "groupJid": { mode: "warn" | "direct", warns: { "userJid": count } } }

const LINK_REGEX = /(?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/)[^\s]*/gi;
const WHATSAPP_INVITE_REGEX = /chat\.whatsapp\.com\/[a-zA-Z0-9]+/gi;

export default async function antilinkCommand(client, message, args) {
    const jid = message.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
        return client.sendMessage(jid, { text: '❌ *Groupes uniquement*' }, { quoted: message });
    }

    const sender = message.key.participant || jid;

    try {
        const metadata = await client.groupMetadata(jid);
        const isAdmin = metadata.participants.filter(p => p.admin).some(p => p.id === sender);

        if (!isAdmin) {
            return client.sendMessage(jid, { text: '❌ *Tu dois être admin pour utiliser cette commande*' }, { quoted: message });
        }

        const query = args[0]?.toLowerCase();

        // Affichage des instructions si aucun argument ou argument invalide
        if (!query || (query !== 'warn' && query !== 'direct' && query !== 'off')) {
            return client.sendMessage(jid, { text: 
`﹝╎🚫 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨

⸙﹝ antilink warn ﹞✴︎
_3 avertissements avant exclusion_

⸙﹝ antilink direct ﹞✴︎
_Exclusion immédiate_

⸙﹝ antilink off ﹞✴︎
_Désactiver la protection_

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` 
            }, { quoted: message });
        }

        if (query === 'off') {
            delete antilinkSettings[jid];
            return client.sendMessage(jid, { text: '🔴 *Antilink désactivé.*' }, { quoted: message });
        }

        // Activation du mode choisi
        antilinkSettings[jid] = {
            mode: query,
            warns: {}
        };

        const msgMode = query === 'direct' 
            ? '🚀 *Mode Direct* : Suppression et exclusion immédiate.' 
            : '⚠️ *Mode Avertissement* : 3 chances avant l\'exclusion.';

        return client.sendMessage(jid, { 
            text: `🟢 *Antilink activé !*\n\n${msgMode}` 
        }, { quoted: message });

    } catch (e) {
        console.error(e);
        client.sendMessage(jid, { text: '❌ *Erreur*' }, { quoted: message });
    }
}

export async function handleAntilink(client, message) {
    const jid = message.key.remoteJid;
    const settings = antilinkSettings[jid];

    if (!jid?.endsWith('@g.us') || !settings) return;

    const sender = message.key.participant || jid;
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || 
                 message.message?.imageMessage?.caption || message.message?.videoMessage?.caption || '';

    if (!LINK_REGEX.test(text) && !WHATSAPP_INVITE_REGEX.test(text)) return;

    try {
        const metadata = await client.groupMetadata(jid);
        const isAdmin = metadata.participants.filter(p => p.admin).some(p => p.id === sender);
        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';

        if (isAdmin || sender === botId) return;

        // 1. Suppression du message
        await client.sendMessage(jid, { delete: message.key });

        // 2. Action selon le mode
        if (settings.mode === 'direct') {
            await client.groupParticipantsUpdate(jid, [sender], 'remove');
            await client.sendMessage(jid, {
                text: `🚫 *Lien interdit !*\n@${sender.split('@')[0]} a été exclu directement.`
            });
        } else {
            // Mode avertissement
            settings.warns[sender] = (settings.warns[sender] || 0) + 1;
            const count = settings.warns[sender];

            if (count < 3) {
                await client.sendMessage(jid, {
                    text: `⚠️ *@${sender.split('@')[0]} arrete d’envoyé des lien dans le groupe connards* (${count}/3)`,
                    mentions: [sender]
                });
            } else {
                await client.groupParticipantsUpdate(jid, [sender], 'remove');
                delete settings.warns[sender];
                await client.sendMessage(jid, {
                    text: `🚫 *Exclusion !*\n@${sender.split('@')[0]} a été banni après 3 avertissements.`,
                    mentions: [sender]
                });
            }
        }
    } catch (e) {
        console.error('[ANTILINK ERROR]', e);
    }
}
