// commands/song.js

// @cat: media

import yts from 'yt-search'

import axios from 'axios'

import fs from 'fs'

// Configuration des clés API pour alternance

const API_KEYS = [

    '0a52dff07cmshdf55b3f391aee31p1f7cd5jsn44e49ccea12f',

    '8b6e431195msh4bbb0cb84a3abfbp1f02b5jsnfccc2f87aa44'

]

const API_HOST = 'youtube-mp36.p.rapidapi.com'

const COUNTER_FILE = './song_counter.json'

// Lire ou créer le compteur

function getCounter() {

    if (fs.existsSync(COUNTER_FILE)) {

        const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf-8'))

        return data.index || 0

    }

    return 0

}

// Sauvegarder le compteur

function saveCounter(index) {

    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ index: index }, null, 2))

}

// Obtenir la clé API à utiliser (alternance)

function getCurrentApiKey() {

    const counter = getCounter()

    const apiKey = API_KEYS[counter % API_KEYS.length]

    return { apiKey, counter }

}

// Passer à la clé suivante pour la prochaine requête

function nextKey() {

    const counter = getCounter()

    const nextIndex = counter + 1

    saveCounter(nextIndex)

    return API_KEYS[nextIndex % API_KEYS.length]

}

// Télécharge ET retourne le buffer

async function getAudioBuffer(videoId) {

    const { apiKey, counter } = getCurrentApiKey()

    const keyNumber = (counter % API_KEYS.length) + 1

    

    console.log(`🔑 Utilisation de la clé ${keyNumber}/${API_KEYS.length} (${apiKey.substring(0, 10)}...)`)

    // Étape 1 : Récupérer le lien de téléchargement

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

        throw new Error('Pas de lien: ' + (data?.msg || data?.status))

    }

    // Télécharger le fichier audio

    const audioRes = await axios.get(data.link, {

        responseType: 'arraybuffer',

        timeout: 60000,

        headers: {

            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',

            'Referer': 'https://youtube-mp36.p.rapidapi.com/'

        }

    })

    // ✅ Succès : passer à la clé suivante pour la prochaine requête

    const nextApiKey = nextKey()

    console.log(`✅ Succès avec clé ${keyNumber}. Prochaine requête utilisera clé ${((counter + 1) % API_KEYS.length) + 1}`)

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