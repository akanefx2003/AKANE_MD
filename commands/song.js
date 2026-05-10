// commands/song.js
// @cat: media

import yts from 'yt-search'
import axios from 'axios'

const RAPIDAPI_KEY = '0a52dff07cmshdf55b3f391aee31p1f7cd5jsn44e49ccea12f'
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R'
const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹'

// ========== DOWNLOAD MP3 VIA youtube-mp36 ==========

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
    console.log('[SONG MP36 DEBUG]', JSON.stringify(data).substring(0, 300))

    if (data?.status === 'ok' && data?.link) {
        return { url: data.link, title: data.title }
    }

    // Si en cours de conversion, attendre et réessayer
    if (data?.status === 'processing') {
        await new Promise(r => setTimeout(r, 5000))
        return await downloadMp3(videoId)
    }

    throw new Error('Échec: ' + (data?.msg || data?.status || JSON.stringify(data)))
}

// ========== COMMANDE PRINCIPALE ==========

export default async function songCommand(client, message, args) {

    const remoteJid = message.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        await client.sendMessage(remoteJid, { text:
`🎵 *SONG - TÉLÉCHARGER UNE MUSIQUE*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *UTILISATION :*

• *song [titre ou artiste]*

💡 *EXEMPLES :*

• *song Wally Seck*

• *song opening oshi no ko*

• *song faded alan walker*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWA🌹*` })
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
        await client.sendMessage(remoteJid, { text: `❌ *Aucune musique trouvée pour :* _"${query}"_` })
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
            caption:
`🎵 *${video.title}*

⏱️ *Durée :* ${video.timestamp}
👀 *Vues :* ${Number(video.views).toLocaleString()}

⬇️ _Téléchargement en cours..._`
        })
    } catch (e) {
        await client.sendMessage(remoteJid, { text: `✅ *Trouvé :* ${video.title}\n⬇️ _Téléchargement..._` })
    }

    try {

        const dl = await downloadMp3(videoId)

        await client.sendMessage(remoteJid, {
            audio: { url: dl.url },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${video.title}.mp3`
        })

        await client.sendMessage(remoteJid, { text:
`✅ *MUSIQUE ENVOYÉE !*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎵 *${video.title}*
⏱️ *Durée :* ${video.timestamp}
🎧 *Format :* MP3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥
*${CHANNEL_NAME}*
${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*` })

        console.log('✅ Song envoyé :', video.title)

    } catch (e) {

        console.error('[SONG ERROR]', e.message)

        await client.sendMessage(remoteJid, { text:
`❌ *Téléchargement impossible*

😔 _"${video.title}"_

> *DEV : 🍁AKANE KUROGAWA🌹*` })
    }
}
