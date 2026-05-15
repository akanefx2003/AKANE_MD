import fs from 'fs';

import { downloadMediaMessage } from 'baileys';

import { exec } from 'child_process';

import path from 'path';

// Dossier temporaire

const tempDir = './temp_media';

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

export async function photo(client, message) {

    const jid = message.key.remoteJid;

    let filename;

    try {

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const target = quoted?.stickerMessage;

        

        if (!target) {

            return await client.sendMessage(jid, {

                text: `﹝╎📸 𝐏𝐇𝐎𝐓𝐎 ╎˼\n⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔\n\n⸙﹝ Répondez à un sticker pour le convertir en image ﹞✴︎\n\n> *© AKANE MD 🌹*`

            });

        }

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer");

        filename = path.join(tempDir, `photo_${Date.now()}.png`);

        fs.writeFileSync(filename, buffer);

        await client.sendMessage(jid, {

            image: fs.readFileSync(filename),

            caption: `﹝╎📸 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 𝐓𝐎 𝐈𝐌𝐆 ╎˼\n\n✨ *Voici votre image convertie.*\n\n> *© AKANE MD 🌹*`

        }, { quoted: message });

    } catch (e) {

        console.error(e);

        await client.sendMessage(jid, { text: "❌ *Erreur lors de la conversion du sticker.*" });

    } finally {

        if (filename && fs.existsSync(filename)) fs.unlinkSync(filename);

    }

}

export async function tomp3(client, message) {

    const jid = message.key.remoteJid;

    let inputPath, outputPath;

    try {

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const target = quoted?.videoMessage || quoted?.audioMessage;

        

        if (!target) {

            return await client.sendMessage(jid, {

                text: `﹝╎🎵 𝐀𝐔𝐃𝐈𝐎 ╎˼\n⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔\n\n⸙﹝ Répondez à une vidéo pour extraire le MP3 ﹞✴︎\n\n> *© AKANE MD 🌹*`

            });

        }

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer");

        const uniqueId = Date.now();

        inputPath = path.join(tempDir, `input_${uniqueId}`);

        outputPath = path.join(tempDir, `output_${uniqueId}.mp3`);

        fs.writeFileSync(inputPath, buffer);

        // Conversion via FFmpeg

        await new Promise((resolve, reject) => {

            exec(`ffmpeg -i ${inputPath} -vn -ab 128k -ar 44100 -y ${outputPath}`, (err) => {

                if (err) return reject(err);

                resolve();

            });

        });

        await client.sendMessage(jid, {

            audio: fs.readFileSync(outputPath),

            mimetype: 'audio/mp4',

            ptt: false

        }, { quoted: message });

    } catch (e) {

        console.error(e);

        await client.sendMessage(jid, { text: "❌ *Erreur lors de l'extraction audio.*" });

    } finally {

        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    }

}

export default { photo, tomp3 };

