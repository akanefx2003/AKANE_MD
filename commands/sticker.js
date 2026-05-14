import pkg from 'wa-sticker-formatter';
const { Sticker, StickerTypes } = pkg;
import { downloadContentFromMessage } from 'baileys';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

ffmpeg.setFfmpegPath(ffmpegPath);

const sticker = async (client, message) => {
    const jid = message.key.remoteJid;
    let tempInput, tempOutput;

    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const msg = message.message?.imageMessage || message.message?.videoMessage ? message.message : quoted;
        
        if (!msg) return;

        const isVideo = !!msg.videoMessage;
        const stream = await downloadContentFromMessage(msg[isVideo ? 'videoMessage' : 'imageMessage'], isVideo ? 'video' : 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        const uniqueId = Date.now();
        tempInput = `./temp_in_${uniqueId}${isVideo ? '.mp4' : '.jpg'}`;
        tempOutput = `./temp_out_${uniqueId}.webp`;
        fs.writeFileSync(tempInput, buffer);

        if (isVideo) {
            await new Promise((resolve, reject) => {
                ffmpeg(tempInput).inputOptions(['-t 8']).outputOptions([
                    "-vcodec libwebp", "-vf scale=320:320:force_original_aspect_ratio=decrease,fps=15,pad=320:320:(320-iw)/2:(320-ih)/2:color=0x00000000",
                    "-lossless 1", "-loop 0", "-an"
                ]).on('end', resolve).on('error', reject).save(tempOutput);
            });
        } else {
            await sharp(tempInput).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toFile(tempOutput);
        }

        const sMetadata = new Sticker(tempOutput, { pack: "AKANE MD 🌹", author: message.pushName, type: StickerTypes.FULL });
        await client.sendMessage(jid, { sticker: await sMetadata.toBuffer() }, { quoted: message });

    } catch (e) {
        console.error(e);
    } finally {
        // 🗑️ NETTOYAGE DU SERVEUR
        if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
        if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
};

export default sticker;
