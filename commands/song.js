// commands/song.js
// @cat: media

import yts from 'yt-search'
import axios from 'axios'

const RAPIDAPI_KEY = '0a52dff07cmshdf55b3f391aee31p1f7cd5jsn44e49ccea12f'

// Télécharge ET retourne le buffer en une seule requête rapide
async function getAudioBuffer(videoId) {

    // Étape 1 + 2 en une seule fois : récupère le lien ET télécharge immédiatement
    const dlRes = await axios.get('https://youtube-mp36.p.rapidapi.com/dl', {
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
        },
        timeout: 30000
    })

    const data = dlRes.data

    if (data?.status === 'processing') {
        await new Promise(r => setTimeout(r, 3000))
        return await getAudioBuffer(videoId)
    }

    if (data?.status !== 'ok' || !data?.link) {
        throw new Error('Pas de lien: ' + (data?.msg || data?.status))
    }

    // Télécharger immédiatement sans délai
    const audioRes = await axios.get(data.link, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://youtube-mp36.p.rapidapi.com/'
        }
    })

    return { buffer: Buffer.from(audioRes.data), title: data.title }
}

export default async function songCommand(client, message, args) {

    const remoteJid = message.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        await client.sendMessage(remoteJid, { text:
`﹝╎🎵 𝐒𝐎𝐍𝐆 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨
⸙﹝ song [titre ou artiste] ﹞✴︎

⋆.˚⪩ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞𝐬 ⪨
⸙﹝ song Wally Seck ﹞✴︎
⸙﹝ song opening oshi no ko ﹞✴︎
⸙﹝ song faded alan walker ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` })
        return
    }

    await client.sendMessage(remoteJid, { text: `🔍 *Recherche de "${query}"...*` })

    let video
    try {
        const search = await yts(query)
        video = search.videos[0]
    } catch (e) {
        console.error('[SONG YTS]', e.message)
    }

    if (!video) {
        await client.sendMessage(remoteJid, { text: `❌ *Aucune musique trouvée pour :* _"${query}"_\n\n> *© AKANE MD 🌹*` })
        return
    }

    const videoId = video.videoId || video.url?.split('v=')[1]?.split('&')[0]

    if (!videoId) {
        await client.sendMessage(remoteJid, { text: `❌ *Impossible de récupérer l'ID*\n\n> *© AKANE MD 🌹*` })
        return
    }

    try {
        await client.sendMessage(remoteJid, {
            image: { url: video.thumbnail },
            caption:
`﹝╎🎵 𝐌𝐮𝐬𝐢𝐪𝐮𝐞 𝐭𝐫𝐨𝐮𝐯𝐞́𝐞 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐓𝐢𝐭𝐫𝐞 ⪨
⸙﹝ ${video.title} ﹞✴︎

⋆.˚⪩ 𝐃𝐮𝐫𝐞́𝐞 ⪨
⸙﹝ ${video.timestamp} ﹞✴︎

⋆.˚⪩ 𝐕𝐮𝐞𝐬 ⪨
⸙﹝ ${Number(video.views).toLocaleString()} ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

⬇️ _Téléchargement en cours..._

> *© AKANE MD 🌹*`
        })
    } catch (e) {
        await client.sendMessage(remoteJid, { text: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n\n⬇️ _Téléchargement..._\n\n> *© AKANE MD 🌹*` })
    }

    try {

        const { buffer, title } = await getAudioBuffer(videoId)

        await client.sendMessage(remoteJid, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${title || video.title}.mp3`
        })

        console.log('✅ Song envoyé :', video.title)

    } catch (e) {

        console.error('[SONG ERROR]', e.message)

        await client.sendMessage(remoteJid, { text:
`❌ *Téléchargement impossible*

⸙﹝ _"${video.title}"_ ﹞✴︎

> *© AKANE MD 🌹*` })
    }
}
