// commands/tg.js
// @cat: media

import axios from 'axios';

const TG_TOKEN = '8704519258:AAFDpQ6LpmOJpyGsSR_6TkHcyeMpBOK8DT4';
const TG_API   = `https://api.telegram.org/bot${TG_TOKEN}`;
const TG_FILE  = `https://api.telegram.org/file/bot${TG_TOKEN}`;

const activeSessions = new Map();

// ─── Récupérer le pack Telegram ───────────────────────────────────────────────

async function getStickerPack(packName) {

    const res = await axios.get(`${TG_API}/getStickerSet`, {
        params:  { name: packName },
        timeout: 15000
    });

    if (!res.data?.ok) throw new Error('Pack introuvable');

    return res.data.result;

}

// ─── Télécharger un sticker en buffer depuis Telegram ────────────────────────

async function downloadSticker(fileId) {

    const infoRes = await axios.get(`${TG_API}/getFile`, {
        params:  { file_id: fileId },
        timeout: 10000
    });

    if (!infoRes.data?.ok) throw new Error('File info failed');

    const filePath = infoRes.data.result.file_path;

    const fileRes = await axios.get(`${TG_FILE}/${filePath}`, {
        responseType: 'arraybuffer',
        timeout:      30000
    });

    return Buffer.from(fileRes.data);

}

// ─── Commande principale ─────────────────────────────────────────────────────

export default async function tgstickerCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;
    const sender    = message.key.participant || message.key.remoteJid;
    const input     = args[0]?.trim();

    // ── STOP ──────────────────────────────────────────────────────────────────
    if (input === 'stop') {

        if (activeSessions.has(sender)) {

            activeSessions.set(sender, { stopped: true });

            await client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⛔ TÉLÉCHARGEMENT ARRÊTÉ !*
┊
╰─────────────────❂`
            });

        } else {

            await client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ AUCUN TÉLÉCHARGEMENT EN COURS*
┊
╰─────────────────❂`
            });

        }

        return;

    }

    // ── AIDE ──────────────────────────────────────────────────────────────────
    if (!input) {

        await client.sendMessage(remoteJid, {
            image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/f216.jpg' },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🎭 TGSTICKER*
┊
*┊📝 UTILISATION :*
*┊.tg [LIEN DU PACK]*
┊
*┊💡 EXEMPLE :*
*┊.tg https://t.me/addstickers/nom*
┊
*┊⛔ POUR ARRÊTER :*
*┊.tg stop*
┊
╰─────────────────❂`
        });

        return;

    }

    // ── Déjà en cours ─────────────────────────────────────────────────────────
    if (activeSessions.has(sender)) {

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⏳ DÉJÀ EN COURS !*
*┊Tape .tg stop pour arrêter.*
┊
╰─────────────────❂`
        });

        return;

    }

    // ── Nom du pack ────────────────────────────────────────────────────────────
    let packName = input;

    const match = input.match(/t\.me\/addstickers\/([^\s/]+)/);

    if (match) packName = match[1];

    await client.sendMessage(remoteJid, {
        text: `🔍 *Récupération du pack :* _${packName}_...`
    });

    try {

        const pack     = await getStickerPack(packName);
        const stickers = pack.stickers || [];

        // Séparer les types
        const staticList   = stickers.filter(s => !s.is_animated && !s.is_video);
        const videoList    = stickers.filter(s => s.is_video);
        const animatedList = stickers.filter(s => s.is_animated);

        // Tous les stickers compatibles (statiques + vidéo)
        // Les .tgs (lottie) sont ignorés car non supportés par WhatsApp
        const sendList = [...staticList, ...videoList];
        const total    = sendList.length;

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🎭 PACK TROUVÉ !*
┊
*┊📦 NOM : ${pack.title}*
┊
*┊🖼️ STATIQUES : ${staticList.length}*
*┊🎬 VIDÉO : ${videoList.length}*
*┊✨ ANIMÉS .tgs : ${animatedList.length} (ignorés)*
*┊📊 TOTAL ENVOI : ${total}*
┊
*┊⬇️ ENVOI EN COURS...*
*┊(.tg stop pour arrêter)*
┊
╰─────────────────❂`
        });

        if (total === 0) {

            await client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ AUCUN STICKER COMPATIBLE*
┊
╰─────────────────❂`
            });

            return;

        }

        activeSessions.set(sender, { stopped: false });

        let success = 0;
        let failed  = 0;

        // ── Envoi sticker par sticker immédiatement ────────────────────────────
        for (let i = 0; i < total; i++) {

            const session = activeSessions.get(sender);
            if (!session || session.stopped) {

                await client.sendMessage(remoteJid, {
                    text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⛔ ARRÊTÉ !*
┊
*┊✅ ENVOYÉS : ${success}*
*┊❌ ÉCHOUÉS : ${failed}*
┊
╰─────────────────❂`
                });

                activeSessions.delete(sender);
                return;

            }

            const sticker = sendList[i];

            try {

                // ✅ Télécharger le buffer brut depuis Telegram
                const buffer = await downloadSticker(sticker.file_id);

                if (sticker.is_video) {

                    // ✅ Vidéo WebM → envoyer comme video/mp4 sticker animé
                    await client.sendMessage(remoteJid, {
                        sticker:    buffer,
                        mimetype:   'video/mp4',
                        isAnimated: true
                    });

                } else {

                    // ✅ Image WebP → envoyer directement SANS conversion
                    // Telegram envoie déjà en WebP 512x512 — pas besoin de sharp
                    await client.sendMessage(remoteJid, {
                        sticker:  buffer,
                        mimetype: 'image/webp'
                    });

                }

                success++;

                // Délai court pour ne pas spammer
                await new Promise(r => setTimeout(r, 600));

            } catch (e) {

                console.error(`[TG] Sticker ${i + 1} échoué:`, e.message);
                failed++;

            }

        }

        activeSessions.delete(sender);

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ PACK TERMINÉ !*
┊
*┊✅ ENVOYÉS : ${success}*
*┊❌ ÉCHOUÉS : ${failed}*
┊
╰─────────────────❂`
        });

    } catch (e) {

        activeSessions.delete(sender);
        console.error('[TGSTICKER ERROR]', e.message);

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ PACK INTROUVABLE*
┊
*┊🔍 "${packName}"*
┊
*┊💡 Vérifie que le lien est correct.*
┊
╰─────────────────❂`
        });

    }

}
