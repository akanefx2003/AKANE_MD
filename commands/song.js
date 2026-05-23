// commands/song.js

// @cat: media

import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'

const API_KEYS = [
    '25222978fdmshe6b4366767fb8e6p18086bjsnee54a88ff976',
    5b1f7e8168msh62ce2d53951cc9ap1678a4jsn7af1076e73c6'
]

const API_HOST = 'youtube-mp36.p.rapidapi.com'
const COUNTER_FILE = './song_counter.json'
const HELP_IMAGE_URL = 'https://raw.githubusercontent.com/toge021/Media/main/377a.jpg'

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

export default async function songCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    const query = args.join(' ').trim()

    // AIDE
    if (!query) {
        try {
            await client.sendMessage(remoteJid, {
                image: { url: HELP_IMAGE_URL },
                caption: `╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊🎵 AKANE MD*
┊
*┊🍋 UTILISATION : .SONG [TITRE]*
┊
*┊🍓 EXEMPLE : .SONG OSHI NO KO*
┊
╰───────────────────❂`
            })
        } catch (e) {
            await client.sendMessage(remoteJid, { text: `╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊🎵 AKANE MD*
┊
*┊🍋 UTILISATION : .SONG [TITRE]*
┊
*┊🍓 EXEMPLE : .SONG OSHI NO KO*
┊
╰───────────────────❂` })
        }
        return
    }

    await client.sendMessage(remoteJid, { text: `*🔍 RECHERCHE DE "${query.toUpperCase()}"...*` })

    let video
    try {
        const search = await yts(query)
        video = search.videos[0]
    } catch (e) {
        console.error('[SONG ERROR]', e.message)
    }

    if (!video) {
        await client.sendMessage(remoteJid, { text: `*❌ AUCUN RESULTAT : "${query.toUpperCase()}"*` })
        return
    }

    const videoId = video.videoId || video.url?.split('v=')[1]?.split('&')[0]

    if (!videoId) {
        await client.sendMessage(remoteJid, { text: `*❌ ID INTROUVABLE*` })
        return
    }

    let titleDisplay = video.title.toUpperCase()
    if (titleDisplay.length > 40) {
        titleDisplay = titleDisplay.substring(0, 37) + '...'
    }

    const caption = `╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🎵 AKANE MD*
┊
*┊🌹 TITRE : ${titleDisplay}*
┊
*┊⏱️ DUREE : ${video.timestamp || '???'}*
┊
*┊👀 VUES :* *${Number(video.views).toLocaleString()}*
┊
╰─────────────────❂

*⬇️ TELECHARGEMENT EN COURS...*`

    try {
        await client.sendMessage(remoteJid, {
            image: { url: video.thumbnail },
            caption: caption
        })
    } catch (e) {
        await client.sendMessage(remoteJid, { text: caption })
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
        await client.sendMessage(remoteJid, { text: `*❌ TELECHARGEMENT IMPOSSIBLE*\n\n*"${video.title.toUpperCase()}"*` })
    }
}