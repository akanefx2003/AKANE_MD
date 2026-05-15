import pkg from 'wa-sticker-formatter';

const { Sticker, StickerTypes } = pkg;

import { downloadContentFromMessage } from 'baileys';

import fs from 'fs';

import ffmpeg from 'fluent-ffmpeg';

import ffmpegPath from 'ffmpeg-static';

import sharp from 'sharp';

ffmpeg.setFfmpegPath(ffmpegPath);

export async function sticker(client, message) {

    const jid = message.key.remoteJid;

    let tempInput, tempOutput;

    try {

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const msg = message.message?.imageMessage || message.message?.videoMessage ? message.message : quoted;

        

        if (!msg || (!msg.imageMessage && !msg.videoMessage)) {

            return client.sendMessage(jid, { text: 

`﹝╎🎨 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⸙﹝ Veuillez citer une photo ou une vidéo ﹞✴︎

> *© AKANE MD 🌹*` });

        }

        const isVideo = !!msg.videoMessage;

        const username = message.pushName || "AKANE MD";

        // Téléchargement du média

        const stream = await downloadContentFromMessage(msg[isVideo ? 'videoMessage' : 'imageMessage'], isVideo ? 'video' : 'image');

        let buffer = Buffer.from([]);

        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        // Fichiers temporaires avec ID unique

        const uniqueId = Date.now();

        tempInput = `./temp_in_${uniqueId}${isVideo ? '.mp4' : '.jpg'}`;

        tempOutput = `./temp_out_${uniqueId}.webp`;

        fs.writeFileSync(tempInput, buffer);

        if (isVideo) {

            // Conversion vidéo en sticker animé carré (pad=320:320 force le carré)

            await new Promise((resolve, reject) => {

                ffmpeg(tempInput)

                    .inputOptions(['-t 8'])

                    .outputOptions([

                        "-vcodec libwebp",

                        "-vf scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:(320-iw)/2:(320-ih)/2:color=0x00000000",

                        "-lossless 1", "-loop 0", "-an", "-vsync 0"

                    ])

                    .on('end', resolve)

                    .on('error', reject)

                    .save(tempOutput);

            });

        } else {

            // Conversion image en carré parfait avec Sharp (bordures transparentes)

            await sharp(tempInput)

                .resize(512, 512, { 

                    fit: 'contain', 

                    background: { r: 0, g: 0, b: 0, alpha: 0 } 

                })

                .webp()

                .toFile(tempOutput);

        }

        const stickerMetadata = new Sticker(tempOutput, {

            pack: `Pack de ${username}`,

            author: "AKANE MD 🌹",

            type: StickerTypes.FULL, // Force le format plein

            quality: 70

        });

        await client.sendMessage(jid, await stickerMetadata.toMessage(), { quoted: message });

    } catch (e) {

        console.error(e);

        await client.sendMessage(jid, { text: "❌ *Erreur lors de la création du sticker.*" });

    } finally {

        // ✅ NETTOYAGE CRITIQUE DU DISQUE

        if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput);

        if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

    }

}

export default sticker;

