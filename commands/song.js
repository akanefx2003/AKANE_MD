// commands/song.js
// @cat: media

import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'

// Configuration des clés API
const API_KEYS = [
    '0a52dff07cmshdf55b3f391aee31p1f7cd5jsn44e49ccea12f',
    '8b6e431195msh4bbb0cb84a3abfbp1f02b5jsnfccc2f87aa44'
]
const API_HOST = 'youtube-mp36.p.rapidapi.com'
const COUNTER_FILE = './song_counter.json'
const HELP_IMAGE_URL = 'https://raw.githubusercontent.com/toge021/Media/main/ab12.jpg'

function getCounter() {
    if (fs.existsSync(COUNTER_FILE)) {
        const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf-8'))
        return data.index || 0
    }
    return 0
}

function saveCounter(index) {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ index: index }, null, 2))
}

function getCurrentApiKey() {
    const counter = getCounter()
    const apiKey = API_KEYS[counter % API_KEYS.length]
    return { apiKey, counter }
}

function nextKey() {
    const counter = getCounter()
    const nextIndex = counter + 1
    saveCounter(nextIndex)
    return API_KEYS[nextIndex % API_KEYS.length]
}

export async function getAudioBuffer(videoId) {
    const { apiKey, counter } = getCurrentApiKey()
    const keyNumber = (counter % API_KEYS.length) + 1
    
    console.log(`🔑 CLE ${keyNumber}/${API_KEYS.length}`)

    const dlRes = await axios.get('https://youtube-mp36.p.rapidapi.com/dl', {
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': API_HOST
        },
        timeout: 30000
    })

    const data = dlRes.data
    if (data?.status === 'processing') {
        await new Promise(r => setTimeout(r, 3000))
        return await getAudioBuffer(videoId)
    }

    if (data?.status !== 'ok' || !data?.link) {
        throw new Error('ERREUR DE TELECHARGEMENT')
    }

    const audioRes = await axios.get(data.link, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://youtube-mp36.p.rapidapi.com/'
        }
    })

    nextKey()
    return { buffer: Buffer.from(audioRes.data), title: data.title }
}

// Fonction pour mettre en gras (WhatsApp utilise *texte*)
function bold(text) {
    return `*${text.toUpperCase()}*`
}

export default async function songCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    const query = args.join(' ').trim()

    // SI PAS DE TITRE → ENVOIE L'IMAGE D'AIDE
    if (!query) {
        try {
            await client.sendMessage(remoteJid, {
                image: { url: HELP_IMAGE_URL },
                caption: `╭─✧🤍⃝⃘̉̉̉━⋆─⋆──❂
┊
┊ 🎵 *𝐀𝐊𝐀𝐍𝐄 𝐌𝐃* 🎵
┊
┊ 📌 *UTILISATION*
┊ *.SONG [TITRE]*
┊
┊ 📝 *EXEMPLES*
┊ *.SONG IMAGINE DRAGONS*
┊ *.SONG OSHI NO KO*
┊
╰────────────────❂

> *© AKANE MD 🌹*`
            })
        } catch (e) {
            await client.sendMessage(remoteJid, { text: 
`╭─✧🤍⃝⃘̉̉̉━⋆─⋆──❂
┊
┊ 🎵 *𝐀𝐊𝐀𝐍𝐄 𝐌𝐃* 🎵
┊
┊ 📌 *UTILISATION*
┊ *.SONG [TITRE]*
┊
┊ 📝 *EXEMPLES*
┊ *.SONG IMAGINE DRAGONS*
┊ *.SONG OSHI NO KO*
┊
╰────────────────❂

> *© AKANE MD 🌹*` })
        }
        return
    }

    // RECHERCHE DE LA MUSIQUE
    await client.sendMessage(remoteJid, { text: bold(`🔍 RECHERCHE DE "${query}"...`) })

    let video
    try {
        const search = await yts(query)
        video = search.videos[0]
    } catch (e) {
        console.error('[SONG ERROR]', e.message)
    }

    if (!video) {
        await client.sendMessage(remoteJid, { text: bold(`❌ AUCUN RESULTAT POUR : "${query}"\n\n> © AKANE MD 🌹`) })
        return
    }

    const videoId = video.videoId || video.url?.split('v=')[1]?.split('&')[0]

    if (!videoId) {
        await client.sendMessage(remoteJid, { text: bold(`❌ IMPOSSIBLE DE RECUPERER L'ID\n\n> © AKANE MD 🌹`) })
        return
    }

    // FORMATAGE DU TITRE (tronqué si trop long)
    let titleDisplay = video.title.toUpperCase()
    if (titleDisplay.length > 45) {
        titleDisplay = titleDisplay.substring(0, 42) + '...'
    }

    try {
        await client.sendMessage(remoteJid, {
            image: { url: video.thumbnail },
            caption: `╭─✧🤍⃝⃘̉̉̉━⋆─⋆──❂
┊
┊ 🎵 *𝐀𝐊𝐀𝐍𝐄 𝐌𝐃* 🎵
┊
┊ 📌 *TITRE*
┊ ${bold(titleDisplay)}
┊
┊ ⏱️ *DUREE*
┊ ${bold(video.timestamp || '???')}
┊
┊ 👀 *VUES*
┊ ${bold(Number(video.views).toLocaleString())}
┊
╰────────────────❂

${bold('⬇️ TELECHARGEMENT EN COURS...')}

> *© AKANE MD 🌹*`
        })
    } catch (e) {
        await client.sendMessage(remoteJid, { text: 
`╭─✧🤍⃝⃘̉̉̉━⋆─⋆──❂
┊
┊ 🎵 *𝐀𝐊𝐀𝐍𝐄 𝐌𝐃* 🎵
┊
┊ 📌 *TITRE*
┊ ${bold(titleDisplay)}
┊
┊ ⏱️ *DUREE*
┊ ${bold(video.timestamp || '???')}
┊
┊ 👀 *VUES*
┊ ${bold(Number(video.views).toLocaleString())}
┊
╰────────────────❂

${bold('⬇️ TELECHARGEMENT EN COURS...')}

> *© AKANE MD 🌹*` })
    }

    try {
        const { buffer, title } = await getAudioBuffer(videoId)
        await client.sendMessage(remoteJid, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${(title || video.title).toUpperCase()}.mp3`
        })
        console.log('✅ SONG ENVOYE :', video.title)
    } catch (e) {
        console.error('[SONG ERROR]', e.message)
        await client.sendMessage(remoteJid, { text: bold(`❌ TELECHARGEMENT IMPOSSIBLE\n\n"${video.title.toUpperCase()}"\n\n> © AKANE MD 🌹`) })
    }
}