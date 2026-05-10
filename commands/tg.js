// commands/tgsticker.js
// @cat: media

import axios from 'axios'
import sharp from 'sharp'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const TG_TOKEN = '8704519258:AAFDpQ6LpmOJpyGsSR_6TkHcyeMpBOK8DT4'
const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`
const TG_FILE = `https://api.telegram.org/file/bot${TG_TOKEN}`

const PACK_NAME = '🄳🄴🅅 🄰🄺🄰🄽🄴 🍒'
const PACK_AUTHOR = '🍁AKANE MD🌹'

const activeSessions = new Map()

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

async function makeSticker(buffer, isAnimated) {
    let inputBuffer = buffer

    // Si sticker statique, convertir en webp avec sharp
    if (!isAnimated) {
        inputBuffer = await sharp(buffer)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp()
            .toBuffer()
    }

    // Ajouter métadonnées pack
    const sticker = new Sticker(inputBuffer, {
        pack: PACK_NAME,
        author: PACK_AUTHOR,
        type: isAnimated ? StickerTypes.FULL : StickerTypes.DEFAULT,
        quality: 100
    })

    return await sticker.toBuffer()
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

        // Compter les types
        const statiques = stickers.filter(s => !s.is_animated && !s.is_video).length
        const animes = stickers.filter(s => s.is_animated || s.is_video).length
        const total = Math.min(stickers.length, limitArg, 100)

        await client.sendMessage(remoteJid, { text:
`﹝╎🎭 𝐏𝐀𝐂𝐊 𝐓𝐑𝐎𝐔𝐕𝐄́ ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐍𝐨𝐦 ⪨
⸙﹝ ${pack.title} ﹞✴︎

⋆.˚⪩ 𝐒𝐭𝐢𝐜𝐤𝐞𝐫𝐬 ⪨
⸙﹝ 🖼️ Statiques : ${statiques} ﹞✴︎
⸙﹝ 🎬 Animés/Vidéo : ${animes} ﹞✴︎
⸙﹝ 📦 Total envoi : ${total} ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

⬇️ _Envoi... (tg stop pour arrêter)_

> *© AKANE MD 🌹*` })

        activeSessions.set(sender, { stopped: false })

        let success = 0
        let failed = 0

        for (let i = 0; i < total; i++) {

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

            const sticker = stickers[i]
            const isAnimated = sticker.is_animated || sticker.is_video

            try {
                const buffer = await downloadSticker(sticker.file_id)
                const stickerBuffer = await makeSticker(buffer, isAnimated)

                await client.sendMessage(remoteJid, {
                    sticker: stickerBuffer,
                    mimetype: 'image/webp'
                })

                success++
                await new Promise(r => setTimeout(r, 400))

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
