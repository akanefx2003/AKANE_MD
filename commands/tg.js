// commands/tgsticker.js
// @cat: media
// 100% en mémoire - aucune écriture sur disque

import axios from 'axios'
import sharp from 'sharp'

const TG_TOKEN = '8704519258:AAFDpQ6LpmOJpyGsSR_6TkHcyeMpBOK8DT4'
const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`
const TG_FILE = `https://api.telegram.org/file/bot${TG_TOKEN}`

const PACK_NAME = '🄳🄴🅅 🄰🄺🄰🄽🄴 🍒'
const PACK_AUTHOR = '🍁AKANE MD🌹'

const activeSessions = new Map()

// Métadonnées EXIF pour le nom du pack (en mémoire, sans fichier temp)
function addStickerMetadata(buffer) {
    // Injecter les métadonnées WhatsApp sticker dans le webp
    // Format: {"sticker-pack-name":"...","sticker-pack-publisher":"..."}
    const metadata = Buffer.from(JSON.stringify({
        'sticker-pack-name': PACK_NAME,
        'sticker-pack-publisher': PACK_AUTHOR
    }))
    // Créer le chunk EXIF WebP avec les métadonnées
    const exifHeader = Buffer.from([0x45, 0x58, 0x49, 0x46]) // "EXIF"
    const chunk = Buffer.concat([exifHeader, metadata])
    return buffer // Retourner buffer original si injection complexe
}

async function getStickerPack(packName) {
    const res = await axios.get(`${TG_API}/getStickerSet`, {
        params: { name: packName }, timeout: 15000
    })
    if (!res.data?.ok) throw new Error('Pack introuvable')
    return res.data.result
}

async function downloadSticker(fileId) {
    const res = await axios.get(`${TG_API}/getFile`, {
        params: { file_id: fileId }, timeout: 10000
    })
    if (!res.data?.ok) throw new Error('Fichier introuvable')
    const filePath = res.data.result.file_path
    const fileRes = await axios.get(`${TG_FILE}/${filePath}`, {
        responseType: 'arraybuffer', timeout: 30000
    })
    return Buffer.from(fileRes.data)
}

// Conversion 100% en mémoire avec sharp
async function makeWebpSticker(buffer) {
    return await sharp(buffer)
        .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toBuffer() // Reste en RAM, jamais écrit sur disque
}

export default async function tgstickerCommand(client, message, args) {

    const remoteJid = message.key.remoteJid
    const sender = message.key.participant || message.key.remoteJid
    const input = args[0]?.trim()
    const limitArg = parseInt(args[1]) || 30

    // ========== STOP ==========
    if (input === 'stop') {
        if (activeSessions.has(sender)) {
            activeSessions.set(sender, { stopped: true })
            await client.sendMessage(remoteJid, { text: `⛔ *Téléchargement arrêté !*\n\n> *© AKANE MD 🌹*` })
        } else {
            await client.sendMessage(remoteJid, { text: `❌ *Aucun téléchargement en cours.*\n\n> *© AKANE MD 🌹*` })
        }
        return
    }

    // ========== HELP ==========
    if (!input) {
        await client.sendMessage(remoteJid, { text:
`﹝╎🎭 𝐓𝐆𝐒𝐓𝐈𝐂𝐊𝐄𝐑 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨
⸙﹝ tgsticker [lien] [nombre] ﹞✴︎

⋆.˚⪩ 𝐀𝐫𝐫𝐞̂𝐭𝐞𝐫 ⪨
⸙﹝ tg stop ﹞✴︎

⋆.˚⪩ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞𝐬 ⪨
⸙﹝ tgsticker https://t.me/addstickers/nom ﹞✴︎
⸙﹝ tgsticker https://t.me/addstickers/nom 10 ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` })
        return
    }

    if (activeSessions.has(sender)) {
        await client.sendMessage(remoteJid, { text: `⏳ *Téléchargement déjà en cours !*\n\nUtilise *tg stop* pour l'arrêter.\n\n> *© AKANE MD 🌹*` })
        return
    }

    let packName = input
    const match = input.match(/t\.me\/addstickers\/([^\s/]+)/)
    if (match) packName = match[1]

    await client.sendMessage(remoteJid, { text: `🔍 *Récupération du pack :* _${packName}_...` })

    try {
        const pack = await getStickerPack(packName)
        const stickers = pack.stickers || []

        // Séparer les types
        const staticList = stickers.filter(s => !s.is_animated && !s.is_video)
        const videoList = stickers.filter(s => s.is_video)
        const animatedList = stickers.filter(s => s.is_animated)

        // On prend statiques + vidéo, on ignore .tgs animés
        const sendList = [...staticList, ...videoList].slice(0, Math.min(limitArg, 100))
        const total = sendList.length

        await client.sendMessage(remoteJid, { text:
`﹝╎🎭 𝐏𝐀𝐂𝐊 𝐓𝐑𝐎𝐔𝐕𝐄́ ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐍𝐨𝐦 ⪨
⸙﹝ ${pack.title} ﹞✴︎

⋆.˚⪩ 𝐒𝐭𝐢𝐜𝐤𝐞𝐫𝐬 ⪨
⸙﹝ 🖼️ Statiques : ${staticList.length} ﹞✴︎
⸙﹝ 🎬 Vidéo : ${videoList.length} ﹞✴︎
⸙﹝ ✨ Animés .tgs : ${animatedList.length} (ignorés) ﹞✴︎
⸙﹝ 📦 Total envoi : ${total} ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

⬇️ _Envoi... (tg stop pour arrêter)_

> *© AKANE MD 🌹*` })

        if (total === 0) {
            await client.sendMessage(remoteJid, { text: `❌ *Aucun sticker compatible dans ce pack.*\n\n> *© AKANE MD 🌹*` })
            return
        }

        activeSessions.set(sender, { stopped: false })

        let success = 0
        let failed = 0

        for (let i = 0; i < total; i++) {

            // Vérifier stop
            const session = activeSessions.get(sender)
            if (!session || session.stopped) {
                await client.sendMessage(remoteJid, { text:
`⛔ *Arrêté !*

⸙﹝ ✅ Envoyés : ${success} ﹞✴︎
⸙﹝ ❌ Échoués : ${failed} ﹞✴︎

> *© AKANE MD 🌹*` })
                activeSessions.delete(sender)
                return
            }

            const sticker = sendList[i]

            try {
                // Télécharger en mémoire
                const buffer = await downloadSticker(sticker.file_id)

                let stickerBuffer

                if (sticker.is_video) {
                    // Vidéo .webm → envoyer directement comme sticker animé
                    stickerBuffer = buffer
                } else {
                    // Image → convertir en webp 512x512 en mémoire
                    stickerBuffer = await makeWebpSticker(buffer)
                }

                await client.sendMessage(remoteJid, {
                    sticker: stickerBuffer,
                    mimetype: 'image/webp'
                })

                success++

                // Libérer la mémoire immédiatement
                stickerBuffer = null

                await new Promise(r => setTimeout(r, 500))

            } catch (e) {
                console.error(`[TGSTICKER] Sticker ${i + 1} échoué:`, e.message)
                failed++
            }
        }

        activeSessions.delete(sender)

        await client.sendMessage(remoteJid, { text:
`✅ *PACK TERMINÉ !*

⸙﹝ ✅ Envoyés : ${success} ﹞✴︎
⸙﹝ ❌ Échoués : ${failed} ﹞✴︎

> *© AKANE MD 🌹*` })

    } catch (e) {
        activeSessions.delete(sender)
        console.error('[TGSTICKER ERROR]', e.message)
        await client.sendMessage(remoteJid, { text:
`❌ *Pack introuvable*

⸙﹝ _"${packName}"_ ﹞✴︎

> *© AKANE MD 🌹*` })
    }
}
