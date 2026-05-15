import { Sticker, StickerTypes } from 'wa-sticker-formatter';

import { downloadMediaMessage } from "baileys";

import fs from "fs";

import path from "path";

export async function take(client, message) {

    const jid = message.key.remoteJid;

    let tempPath;

    try {

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        

        // 1. Vérification si c'est bien un sticker

        if (!quoted || !quoted.stickerMessage) {

            return client.sendMessage(jid, { text: 

`﹝╎👑 𝐓𝐀𝐊𝐄 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⸙﹝ Répondez à un sticker avec un nom pour le voler ﹞✴︎

Exemple : !take Akane MD

> *© AKANE MD 🌹*` });

        }

        // 2. Définition du nom (Args ou pushName)

        const text = message.message?.extendedTextMessage?.text || "";

        const args = text.split(/\s+/).slice(1).join(" ");

        const packName = args || message.pushName || "AKANE MD";

        // 3. Téléchargement du sticker original

        const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console });

        if (!buffer) throw new Error("Téléchargement échoué");

        // 4. Création d'un fichier temporaire unique (pour ne pas saturer le disque)

        tempPath = `./temp_take_${Date.now()}.webp`;

        fs.writeFileSync(tempPath, buffer);

        // 5. Reconstruction du sticker avec tes infos

        const sticker = new Sticker(tempPath, {

            pack: packName, 

            author: "AKANE MD 🌹",

            type: StickerTypes.FULL,

            quality: 70

        });

        // 6. Envoi

        await client.sendMessage(jid, await sticker.toMessage(), { quoted: message });

    } catch (error) {

        console.error("❌ Error Take:", error);

        await client.sendMessage(jid, { text: "❌ *Erreur lors du vol du sticker.*" });

    } finally {

        // ✅ NETTOYAGE INDISPENSABLE

        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    }

}

export default take;

