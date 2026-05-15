import axios from 'axios';

import { downloadMediaMessage } from 'baileys';

import { fileTypeFromBuffer } from 'file-type';

import FormData from 'form-data';

/**

 * Fonction d'upload vers DevHackers

 * Extrait spécifiquement le githubUrl pour éviter le texte bizarre

 */

async function uploadToDevHackers(buffer, fileName) {

    const form = new FormData();

    form.append('file', buffer, { filename: fileName });

    const res = await axios.post('https://devhackers-link-generator.onrender.com/upload', form, {

        headers: { ...form.getHeaders() },

        maxContentLength: Infinity,

        maxBodyLength: Infinity

    });

    // --- NETTOYAGE DU TEXTE BIZZARE ---

    // Ton serveur renvoie un objet avec "githubUrl"

    if (res.data && res.data.githubUrl) {

        return res.data.githubUrl; 

    }

    

    // Si githubUrl n'existe pas, on cherche une autre clé ou on renvoie le lien court

    if (typeof res.data === 'object') {

        return res.data.url || res.data.shortUrl || JSON.stringify(res.data);

    }

    

    return res.data.trim();

}

export async function url(client, message) {

    const jid = message.key.remoteJid;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    

    if (!quoted) {

        return client.sendMessage(jid, { text: 

`﹝╎🔗 𝐔𝐑𝐋 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐑 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⸙﹝ Répondez à un média (Image, Vidéo, Audio, Doc) ﹞✴︎

> *© AKANE MD 🌹*` });

    }

    try {

        const mediaData = quoted.imageMessage || quoted.videoMessage || quoted.audioMessage || quoted.documentMessage;

        if (!mediaData) return client.sendMessage(jid, { text: "❌ *Média non supporté.*" });

        await client.sendMessage(jid, { text: "⏳ *AKANE MD génère le lien GitHub...*" });

        const buffer = await downloadMediaMessage({ message: quoted }, 'buffer');

        if (!buffer) throw new Error("Erreur de téléchargement");

        const type = await fileTypeFromBuffer(buffer);

        const extension = type ? type.ext : (quoted.documentMessage?.fileName?.split('.').pop() || 'bin');

        const fileName = `akane_${Date.now()}.${extension}`;

        // Récupération du lien propre

        const link = await uploadToDevHackers(buffer, fileName);

        await client.sendMessage(jid, { 

            text: 

`﹝╎🔗 𝐔𝐑𝐋 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ✅ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

✨ *Lien direct :*

${link}

📂 *Hébergeur :* DevHackers Cloud

⚖️ *Taille :* ${(buffer.length / 1024 / 1024).toFixed(2)} MB

> *© AKANE MD 🌹*` 

        }, { quoted: message });

    } catch (error) {

        console.error("Erreur DevHackers:", error);

        await client.sendMessage(jid, { text: "❌ *Échec de l'upload.*" });

    }

}

export default url;

