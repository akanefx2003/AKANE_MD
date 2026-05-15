import axios from 'axios';

import sharp from 'sharp';

export async function generate(client, message) {

    const jid = message.key.remoteJid;

    const text = message.message?.extendedTextMessage?.text || message.message?.conversation || "";

    const args = text.split(/\s+/).slice(1).join(" ");

    if (!args) {

        return client.sendMessage(jid, { text: 

`﹝╎🎨 𝐀𝐊𝐀𝐍𝐄 𝐀𝐑𝐓 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⸙﹝ Veuillez fournir une description ﹞✴︎

> *© AKANE MD 🌹*` });

    }

    try {

        await client.sendMessage(jid, { text: "⏳ *AKANE MD génère votre image HD...*" });

        const apiUrl = `https://digix-core.vercel.app/ia/imagine?prompt=${encodeURIComponent(args)}&width=1024&height=1024&model=flux`;

        // 1. Téléchargement avec vérification

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        

        // Vérifier si le contenu reçu est bien une image

        const contentType = response.headers['content-type'];

        if (!contentType || !contentType.includes('image')) {

            throw new Error("L'API n'a pas renvoyé une image valide.");

        }

        // 2. Traitement Sharp

        const buffer = await sharp(response.data)

            .jpeg({ quality: 90 })

            .toBuffer();

        // 3. Envoi

        await client.sendMessage(jid, { 

            image: buffer,

            caption: `﹝╎✨ 𝐈𝐌𝐀𝐆𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ✅ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

🎭 *Prompt :* ${args}

> *© AKANE MD 🌹*`

        }, { quoted: message });

    } catch (error) {

        console.error("Erreur Gen:", error.message);

        await client.sendMessage(jid, { text: "❌ *L'API est surchargée ou le prompt est bloqué. Réessayez plus tard.*" });

    }

}

export default generate;

