// Stockage : { "groupJid": { mode: "warn" | "direct", warns: { "userJid": count } } }

const antilinkSettings = {};

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

            return client.sendMessage(jid, { text: '❌ *Tu dois être admin pour cela.*' }, { quoted: message });

        }

        // Si l'antilink est déjà activé et qu'on ne donne pas d'argument, on l'éteint

        if (antilinkSettings[jid] && !args[0]) {

            delete antilinkSettings[jid];

            return client.sendMessage(jid, { text: '🔴 *Antilink désactivé.*' }, { quoted: message });

        }

        // Choix du mode : par défaut "warn" si rien n'est précisé

        const mode = (args[0] === 'direct') ? 'direct' : 'warn';

        

        antilinkSettings[jid] = {

            mode: mode,

            warns: {}

        };

        const msgMode = mode === 'direct' 

            ? '🚀 *Mode Direct* : Suppression et exclusion immédiate.' 

            : '⚠️ *Mode Avertissement* : 3 chances avant l\'exclusion.';

        return client.sendMessage(jid, { 

            text: `🟢 *Antilink activé !*\n\n${msgMode}\n\n_Utilisez "direct" ou "warn" après la commande pour changer._` 

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

        // 1. Suppression systématique du message

        await client.sendMessage(jid, { delete: message.key });

        // 2. Action selon le mode

        if (settings.mode === 'direct') {

            await client.groupParticipantsUpdate(jid, [sender], 'remove');

            await client.sendMessage(jid, {

                text: `🚫 *Lien interdit !*\n@${sender.split('@')[0]} a été exclu directement.`,

                mentions: [sender]

            });

        } else {

            // Mode avertissement (3 chances)

            settings.warns[sender] = (settings.warns[sender] || 0) + 1;

            const count = settings.warns[sender];

            if (count < 3) {

                await client.sendMessage(jid, {

                    text: `⚠️ *Avertissement (${count}/3)*\n@${sender.split('@')[0]}, les liens sont interdits !`,

                    mentions: [sender]

                });

            } else {

                await client.groupParticipantsUpdate(jid, [sender], 'remove');

                delete settings.warns[sender];

                await client.sendMessage(jid, {

                    text: `🚫 *Exclusion !*\n@${sender.split('@')[0]} a atteint la limite d'avertissements.`,

                    mentions: [sender]

                });

            }

        }

    } catch (e) {

        console.error('[ANTILINK ERROR]', e);

    }

}

