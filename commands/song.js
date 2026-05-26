// commands/song.js

// @cat: media

import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'

const API_KEYS = [
    '25222978fdmshe6b4366767fb8e6p18086bjsnee54a88ff976',
    '5b1f7e8168msh62ce2d53951cc9ap1678a4jsn7af1076e73c6'
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
                caption: `╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🎵 TÉLÉCHARGEUR AUDIO*
┊
*┊📝 UTILISATION :*
*┊.song [TITRE]*
┊
*┊💡 EXEMPLE :*
*┊.song oshi no ko*
┊
━━━━━━━━━━━━━❂`
            })
        } catch (err) {
            console.error('Erreur envoi aide song:', err)
        }
        return
    }

    // CHARGEMENT
    let msgEnCours = null
    try {
        msgEnCours = await client.sendMessage(remoteJid, {
            text: '🔍 *Recherche en cours...*'
        })
    } catch (e) {
        console.error('Erreur envoi msg chargement:', e)
    }

    try {
        // RECHERCHE
        const resultat = await yts(query)

        if (!resultat?.videos?.length) {
            return await client.sendMessage(remoteJid, {
                text: `❌ *"${query}" non trouvé sur YouTube*`
            })
        }

        const video = resultat.videos[0]
        const videoId = video.videoId

        // TÉLÉCHARGEMENT
        await client.sendMessage(remoteJid, {
            text: '⏳ *Téléchargement...*'
        }, { quoted: message })

        const { buffer, title } = await getAudioBuffer(videoId)

        // ENVOI
        await client.sendMessage(remoteJid, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ MUSIQUE TÉLÉCHARGÉE !*
┊
*┊🎵 ${title}*
*┊⏱️ ${video.seconds}s*
┊
━━━━━━━━━━━━━❂`
        }, { quoted: message })

    } catch (err) {
        console.error('❌ Erreur song:', err.message)
        await client.sendMessage(remoteJid, {
            text: `❌ *Erreur : ${err.message}*`
        })
    }
}
