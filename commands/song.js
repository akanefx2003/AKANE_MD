// commands/song.js
import yts from 'yt-search'
import axios from 'axios'

const RAPIDAPI_KEY = '0a52dff07cmshdf55b3f391aee31p1f7cd5jsn44e49ccea12f'

async function downloadMp3(videoId) {
    const response = await axios.get('https://youtube-mp36.p.rapidapi.com/dl', {
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
        },
        timeout: 30000
    })

    const data = response.data

    if (data?.status === 'ok' && data?.link) {
        return { url: data.link, title: data.title }
    }

    if (data?.status === 'processing') {
        await new Promise(r => setTimeout(r, 5000))
        return await downloadMp3(videoId)
    }

    throw new Error('Échec: ' + (data?.msg || data?.status))
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
        await client.sendMessage(remoteJid, { text: `❌ *Aucune musique trouvée*` })
        return
    }

    const videoId = video.videoId || video.url?.split('v=')[1]?.split('&')[0]

    if (!videoId) {
        await client.sendMessage(remoteJid, { text: `❌ *Impossible de récupérer l'ID*` })
        return
    }

    try {
        await client.sendMessage(remoteJid, {
            image: { url: video.thumbnail },
            caption: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n\n⬇️ Téléchargement...`
        })

        const dl = await downloadMp3(videoId)

        await client.sendMessage(remoteJid, {
            audio: { url: dl.url },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${video.title}.mp3`
        })

        console.log('✅ Song envoyé :', video.title)

    } catch (e) {
        console.error('[SONG ERROR]', e.message)
        await client.sendMessage(remoteJid, { text: `❌ *Téléchargement impossible*` })
    }
}