// commands/sora.js

// @cat: ia

import axios from 'axios'

const API_URL = 'https://api.gifted.co.ke/api/ai/txt2img'

const API_KEY = 'gifted'

export default async function soraCommand(client, message, args) {

    const remoteJid = message.key.remoteJid

    

    // Vérifier si un prompt est fourni

    const prompt = args.join(' ').trim()

    if (!prompt) {

        await client.sendMessage(remoteJid, { text:

`﹝╎🎨 𝐒𝐎𝐑𝐀 𝐀𝐈 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎨 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨

⸙﹝ sora [description de l'image] ﹞✴︎

⋆.˚⪩ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞𝐬 ⪨

⸙﹝ sora un chat qui dort sur la lune ﹞✴︎

⸙﹝ sora paysage futuriste cyberpunk ﹞✴︎

⸙﹝ sora portrait d'une femme manga ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` })

        return

    }

    // Envoyer un message d'attente

    await client.sendMessage(remoteJid, { text: `🎨 *Génération de l'image en cours...*\n\n📝 *Prompt:* ${prompt}\n\n> *© AKANE MD 🌹*` })

    try {

        // Appel à l'API

        const response = await axios.get(API_URL, {

            params: {

                apikey: API_KEY,

                prompt: prompt

            },

            timeout: 60000 // 60 secondes max

        })

        // Vérifier la réponse

        if (response.data?.status === 200 && response.data?.success && response.data?.result?.url) {

            const imageUrl = response.data.result.url

            

            // Envoyer l'image générée

            await client.sendMessage(remoteJid, {

                image: { url: imageUrl },

                caption:

`﹝╎🖼️ 𝐈𝐦𝐚𝐠𝐞 𝐠𝐞́𝐧𝐞́𝐫𝐞́𝐞 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎨 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐏𝐫𝐨𝐦𝐩𝐭 ⪨

⸙﹝ ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''} ﹞✴︎

⋆.˚⪩ 𝐂𝐫𝐞́𝐝𝐢𝐭𝐬 ⪨

⸙﹝ ${response.data.creator || 'GiftedTech'} ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`

            })

            

            console.log(`✅ [SORA] Image générée pour: ${prompt}`)

        } else {

            throw new Error('Réponse API invalide')

        }

    } catch (error) {

        console.error('[SORA ERROR]', error.message)

        await client.sendMessage(remoteJid, { text:

`❌ *Erreur lors de la génération de l'image*

⸙﹝ "${prompt.substring(0, 50)}..." ﹞✴︎

💡 *Essayez:*

• Un prompt plus simple

• Moins de mots

• Réessayer plus tard

> *© AKANE MD 🌹*` })

    }

}