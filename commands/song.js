// commands/song.js
// @cat: media

import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'

const API_KEYS = [
    'dfa2fd991bmsh45ae2a55f84b944p1f9dd0jsnf5b60fc7e48b',
    'dfa2fd991bmsh45ae2a55f84b944p1f9dd0jsnf5b60fc7e48b'
]
// Séquence de rotation : index 0 (clé 1) utilisée 2 fois, puis index 1 (clé 2) une fois
const KEY_SEQUENCE = [0, 0, 1]

const API_HOST = 'youtube-mp36.p.rapidapi.com'
const COUNTER_FILE = './song_counter.json'
const HELP_IMAGE_URL = 'https://cdn.crysnovax.link/files/1781452577091-fce028ee-b5cd-4611-a008-2a8cb70299f7.jpg'
const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCrJRnGufIyytPXy606"
const CHANNEL_BTN = [{ text: 'VOIR LA CHAÎNE 🍁', url: CHANNEL_LINK }]

function getCounter() {
    if (fs.existsSync(COUNTER_FILE)) {
        return JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf-8')).index || 0
    }
    return 0
}

function saveCounter(index) {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ index }, null, 2))
}

// Compteur chargé une seule fois au démarrage du module
let keyIndex = getCounter()

function pickNextKey() {
    const seqPos = keyIndex % KEY_SEQUENCE.length
    const idx = KEY_SEQUENCE[seqPos]
    keyIndex++
    saveCounter(keyIndex)
    return { apiKey: API_KEYS[idx], idx }
}

export async function getAudioBuffer(videoId, reuse = null) {
    const { apiKey, idx } = reuse || pickNextKey()
    console.log(`🔑 CLE ${idx + 1}/${API_KEYS.length}`)

    const dlRes = await axios.get('https://youtube-mp36.p.rapidapi.com/dl', {
        params: { id: videoId },
        headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': API_HOST },
        timeout: 30000
    })

    const data = dlRes.data
    if (data?.status === 'processing') {
        await new Promise(r => setTimeout(r, 3000))
        // On réutilise la même clé pendant l'attente du traitement
        return await getAudioBuffer(videoId, { apiKey, idx })
    }
    if (data?.status !== 'ok' || !data?.link) {
        throw new Error(`API status: ${data?.status || 'inconnu'} - ${data?.msg || 'pas de lien'}`)
    }

    const audioRes = await axios.get(data.link, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://youtube-mp36.p.rapidapi.com/' }
    })

    return { buffer: Buffer.from(audioRes.data), title: data.title }
}

export default async function songCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    const query = args.join(' ').trim()

    // ========== AIDE ==========
    if (!query) {
        return client.sendMessage(remoteJid, {
            image: { url: HELP_IMAGE_URL },
            caption:
`╭┄─̣✦┄─̣✦┄─̣✦┄─̣✦
│ ⊹ *ɑׁׁׅׅƙׁׁׅׅɑׁׁׅׅ݊ꪀׁׅꫀׁׁׅܻׅ݊ ꩇׁׅ֪݊ ׁׅժׁׁׅׅ݊* ⊹
│┄─̣┄─̣┄─̣┄─̣┄─̣
│ *🎵 Tׁׅéׁׅlׁׅéׁׅcׁׅhׁׅaׁׅrׁׅgׁׅeׁׅuׁׅrׁׅ Aׁׅuׁׅdׁׅiׁׅoׁׅ*
│
│ *📝 Uׁׅtׁׅiׁׅlׁׅiׁׅsׁׅaׁׅtׁׅiׁׅoׁׅnׁׅ :*
│ *· .song [TITRE]*
│
│ *🍋‍🟩 Eׁׅxׁׅeׁׅmׁׅpׁׅlׁׅeׁׅ :*
│ *· .song oshi no ko*
╰┄─̣✦┄─̣✦┄─̣✦┄─̣✦

> *© AKANE MD 🌹*`,
            nativeFlow: CHANNEL_BTN
        })
    }

    await client.sendMessage(remoteJid, { text: '🔍 *Recherche en cours...*' })

    try {
        // ========== RECHERCHE ==========
        const resultat = await yts(query)
        if (!resultat?.videos?.length) {
            return client.sendMessage(remoteJid, {
                text:
`╭┄─̣✦┄─̣✦┄─̣✦┄─̣✦
│ ⊹ *ɑׁׁׅׅƙׁׁׅׅɑׁׁׅׅ݊ꪀׁׅꫀׁׁׅܻׅ݊ ꩇׁׅ֪݊ ׁׅժׁׁׅׅ݊* ⊹
│┄─̣┄─̣┄─̣┄─̣┄─̣
│ *❌ Sׁׅtׁׅaׁׅtׁׅuׁׅsׁׅ : Introuvable*
│ *🔍 "${query}" non trouvé*
╰┄─̣✦┄─̣✦┄─̣✦┄─̣✦

> *© AKANE MD 🌹*`,
                nativeFlow: CHANNEL_BTN
            })
        }

        const video = resultat.videos[0]
        const videoId = video.videoId
        const videoUrl = `https://youtu.be/${videoId}`
        const views = video.views ? Number(video.views).toLocaleString('fr-FR') : 'N/A'

        // ========== ENVOYER LIEN + INFO ==========
        // Le lien en premier génère l'aperçu YouTube automatiquement
        await client.sendMessage(remoteJid, {
            image: { url: video.thumbnail },
            caption:
`╭┄─̣✦┄─̣✦┄─̣✦┄─̣✦
│ ⊹ *ɑׁׁׅׅƙׁׁׅׅɑׁׁׅׅ݊ꪀׁׅꫀׁׁׅܻׅ݊ ꩇׁׅ֪݊ ׁׅժׁׁׅׅ݊* ⊹
│┄─̣┄─̣┄─̣┄─̣┄─̣
│ *🎵 Tׁׅiׁׅtׁׅlׁׅeׁׅ : ${video.title}*
│ *⏱️ Dׁׅuׁׅrׁׅeׁׅeׁׅ : ${video.timestamp}*
│ *👀 Vׁׅuׁׅeׁׅsׁׅ : ${views}*
│ *⚙️ Sׁׅtׁׅaׁׅtׁׅuׁׅsׁׅ : Téléchargement...*
╰┄─̣✦┄─̣✦┄─̣✦┄─̣✦

> *© AKANE MD 🌹*`,
            nativeFlow: CHANNEL_BTN
        }, { quoted: message })

        // ========== TÉLÉCHARGEMENT ==========
        const { buffer, title } = await getAudioBuffer(videoId)

        // ========== ENVOI AUDIO SEULEMENT ==========
        await client.sendMessage(remoteJid, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: message })

    } catch (err) {
        const msg = err?.message || 'Erreur inconnue'
        console.error('❌ Erreur song:', msg)
        await client.sendMessage(remoteJid, {
            text:
`╭┄─̣✦┄─̣✦┄─̣✦┄─̣✦
│ ⊹ *ɑׁׁׅׅƙׁׁׅׅɑׁׁׅׅ݊ꪀׁׅꫀׁׁׅܻׅ݊ ꩇׁׅ֪݊ ׁׅժׁׁׅׅ݊* ⊹
│┄─̣┄─̣┄─̣┄─̣┄─̣
│ *❌ Sׁׅtׁׅaׁׅtׁׅuׁׅsׁׅ : Échec*
│ *🔍 Rׁׅaׁׅiׁׅsׁׅoׁׅnׁׅ : ${msg}*
╰┄─̣✦┄─̣✦┄─̣✦┄─̣✦

> *© AKANE MD 🌹*`,
            nativeFlow: CHANNEL_BTN
        })
    }
}
