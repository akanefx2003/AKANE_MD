// commands/google.js
// @cat: media

import axios from 'axios'
import { translateText } from './traduit.js'

const RAPIDAPI_KEY = '0a52dff07cmshdf55b3f391aee31p1f7cd5jsn44e49ccea12f'
const API_HOST = 'google-search74.p.rapidapi.com'

async function googleSearch(query, limit = 8) {
    const response = await axios.get('https://google-search74.p.rapidapi.com/', {
        params: { query, limit, related_keywords: 'true' },
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': API_HOST,
            'Content-Type': 'application/json'
        },
        timeout: 15000
    })
    return response.data
}

// ✅ Fix complet des keywords — extrait uniquement les strings
function formatRelatedKeywords(keywords) {
    if (!keywords) return ''
    let list = []
    if (Array.isArray(keywords)) {
        list = keywords
            .map(k => {
                if (typeof k === 'string') return k
                if (k && typeof k === 'object' && typeof k.keyword === 'string') return k.keyword
                return null
            })
            .filter(k => k !== null && k !== 'null' && k.trim() !== '')
            .slice(0, 5)
    } else if (typeof keywords === 'string') {
        try {
            const parsed = JSON.parse(keywords)
            return formatRelatedKeywords(parsed)
        } catch { list = [keywords] }
    }
    if (!list.length) return ''
    return `\n\n⋆.˚⪩ 𝐑𝐞𝐜𝐡𝐞𝐫𝐜𝐡𝐞𝐬 𝐚𝐬𝐬𝐨𝐜𝐢𝐞́𝐞𝐬 ⪨\n` + list.map(k => `⸙﹝ ${k} ﹞✴︎`).join('\n')
}

export default async function googleCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        await client.sendMessage(remoteJid, { text:
`﹝╎🔍 𝐆𝐎𝐎𝐆𝐋𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🔍 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨
⸙﹝ google [recherche] ﹞✴︎

⋆.˚⪩ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞𝐬 ⪨
⸙﹝ google Sénégal ﹞✴︎
⸙﹝ google intelligence artificielle ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` })
        return
    }

    await client.sendMessage(remoteJid, { text: `🔍 *Recherche de "${query}"...*` })

    try {
        const data = await googleSearch(query)
        const results = data?.results || data?.items

        if (!results || results.length === 0) {
            await client.sendMessage(remoteJid, { text: `❌ *Aucun résultat pour :* _"${query}"_\n\n> *© AKANE MD 🌹*` })
            return
        }

        // Traduire les descriptions
        const formattedResults = await Promise.all(results.map(async (item, index) => {
            const title = item.title || item.name || 'Sans titre'
            const link = item.link || item.url || '#'
            const desc = item.snippet || item.description || ''
            const descFr = desc ? await translateText(desc, 'fr') : ''
            const descClean = descFr.substring(0, 200) + (descFr.length > 200 ? '...' : '')
            return `⋆.˚⪩ *${index + 1}. ${title}* ⪨\n⸙﹝ [🔗 Lien](${link}) ﹞\n⸙﹝ ${descClean} ﹞✴︎`
        }))

        const relatedKeywords = formatRelatedKeywords(data?.related_keywords || data?.relatedKeywords)
        const firstResult = results[0]
        const firstTitle = firstResult?.title || 'Résultat'
        const firstLink = firstResult?.link || firstResult?.url || '#'

        let msg =
`﹝╎🔍 𝐑𝐞́𝐬𝐮𝐥𝐭𝐚𝐭𝐬 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🔍 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐑𝐞𝐜𝐡𝐞𝐫𝐜𝐡𝐞 ⪨
⸙﹝ ${query} ﹞✴︎

⋆.˚⪩ 𝐍𝐨𝐦𝐛𝐫𝐞 ⪨
⸙﹝ ${results.length} résultats ﹞✴︎

⋆.˚⪩ 𝐏𝐫𝐞𝐦𝐢𝐞𝐫 𝐫𝐞́𝐬𝐮𝐥𝐭𝐚𝐭 ⪨
⸙﹝ *${firstTitle}* ﹞✴︎
⸙﹝ [📎 ${firstLink.substring(0, 50)}${firstLink.length > 50 ? '...' : ''}](${firstLink}) ﹞✴︎
${relatedKeywords}

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

📋 *Résultats :*

${formattedResults.join('\n\n')}

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`

        if (msg.length > 4000) msg = msg.substring(0, 3950) + '\n\n> *© AKANE MD 🌹*'

        await client.sendMessage(remoteJid, { text: msg })

    } catch (error) {
        console.error('[GOOGLE ERROR]', error.message)
        await client.sendMessage(remoteJid, { text:
`❌ *Erreur lors de la recherche*

⸙﹝ _"${query}"_ ﹞✴︎
⸙﹝ ${error.message || 'API indisponible'} ﹞✴︎

> *© AKANE MD 🌹*` })
    }
}
