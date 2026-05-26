// commands/wss.js

// @cat: tools

import axios from 'axios';

const IMG_HELP = 'https://raw.githubusercontent.com/toge021/Media/main/7006.tmp';
const IMG_ERROR = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

export default async function wss(client, message, args) {
    const jid = message.key.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const cmd = messageBody.toLowerCase().split(/\s+/)[0].slice(1);

    try {
        // ─── Récupérer le lien - MÊME PRINCIPE QUE URL.JS ───────────────────
        const quoted = message.message?.extendedTextMessage?.quotedMessage;

        let link = args.join(' ');

        // Si pas d'argument, chercher dans le message quoté
        if (!link && quoted) {
            if (quoted.conversation) {
                link = quoted.conversation;
            } else if (quoted.extendedTextMessage?.text) {
                link = quoted.extendedTextMessage.text;
            }
        }

        console.log('[WSS] Link found:', link);

        if (!link) {
            return await client.sendMessage(jid, {
                image: { url: IMG_HELP },
                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📸 SCREENSHOT*
┊
*┊⚠️ REPONDS À UN LIEN*
*┊POUR FAIRE UNE CAPTURE !*
┊
*┊📱 TYPES :*
*┊.wss → Desktop*
*┊.wssp → Téléphone*
*┊.wsstab → Tablette*
*┊.wssfull → Complet*
┊
*┊💡 EXEMPLE :*
*┊Reponds à un lien puis*
*┊tape .wss*
┊
╰─────────────────❂`
            });
        }

        // Extraire le lien si c'est du texte avec plusieurs mots
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundLinks = link.match(urlRegex);
        const targetUrl = foundLinks ? foundLinks[0] : link;

        // Vérifier si c'est un lien valide
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            return await client.sendMessage(jid, {
                image: { url: IMG_HELP },
                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ LIEN INVALIDE*
┊
*┊Utilise un lien complet :*
*┊https://example.com*
┊
╰─────────────────❂`
            });
        }

        // Réaction de chargement
        await client.sendMessage(jid, {
            react: { text: '⏳', key: message.key }
        });

        // Déterminer le type d'appareil
        let device = 'desktop';

        if (cmd === 'wssp' || cmd === 'wssmobile') device = 'phone';
        else if (cmd === 'wsstab') device = 'tablet';
        else if (cmd === 'wssfull') device = 'full';
        else if (cmd === 'wssweb') device = 'desktop';

        // Appeler l'API
        const api = `https://api-rebix.zone.id/api/ssweb?url=${encodeURIComponent(targetUrl)}&device=${device}`;

        const res = await axios.get(api, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(res.data);

        // Réaction de succès
        await client.sendMessage(jid, {
            react: { text: '✅', key: message.key }
        });

        // Envoyer la capture
        await client.sendMessage(jid, {
            image: buffer,
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ SCREENSHOT GÉNÉRÉ !*
┊
*┊🔗 ${targetUrl.substring(0, 40)}*
*┊📱 Device: ${device}*
┊
╰─────────────────❂`
        }, { quoted: message });

    } catch (err) {
        console.error('[WSS ERROR]', err.message);

        // Réaction d'erreur
        await client.sendMessage(jid, {
            react: { text: '❌', key: message.key }
        });

        return await client.sendMessage(jid, {
            image: { url: IMG_ERROR },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR SCREENSHOT*
┊
*┊🔍 RAISON :*
*┊${err.message}*
┊
*┊💡 Réessaie dans quelques*
*┊secondes.*
┊
╰─────────────────❂`
        });
    }
}
