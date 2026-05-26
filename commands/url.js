// commands/url.js

import axios from 'axios';
import { downloadMediaMessage } from '@crysnovax/baileys';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

const IMG_HELP  = 'https://raw.githubusercontent.com/toge021/Media/main/c687.jpg';
const IMG_ERROR = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

// ─── Upload vers CDN Crysnovax (avec bonne extension) ──────────────────────

async function uploadToCrysnovax(buffer, fileName) {

    const form = new FormData();
    form.append('file', buffer, { filename: fileName });

    try {
        const res = await axios.post(
            'https://cdn.crysnovax.link/upload',
            form,
            {
                headers: { ...form.getHeaders() },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 15000
            }
        );

        let url = res.data?.url || res.data?.link || res.data;
        
        if (typeof url === 'object') {
            url = url.url || url.link || JSON.stringify(url);
        }

        return url ? url.trim() : null;
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
}

// ─── Verrou par sender ─────────────────────────────────────────────────────

const processing = new Map();

// ─── Commande principale ─────────────────────────────────────────────────────

export async function url(client, message) {

    const jid    = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;

    if (processing.get(sender)) {
        return client.sendMessage(jid, {
            text: '⏳ *Ton upload est déjà en cours, patiente...*'
        });
    }

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return client.sendMessage(jid, {
            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🔗 URL UPLOADER*
┊
*┊⚠️ RÉPONDS À UN MÉDIA*
*┊POUR GÉNÉRER SON LIEN !*
┊
*┊📁 SUPPORTS :*
*┊🖼️ Image  •  🎥 Vidéo*
*┊🎵 Audio  •  📄 Document*
┊
*┊💡 EXEMPLE :*
*┊Réponds à une image puis*
*┊tape .url*
┊
━━━━━━━━━━━━━❂`
        });
    }

    const mediaData = quoted.imageMessage
        || quoted.videoMessage
        || quoted.audioMessage
        || quoted.documentMessage;

    if (!mediaData) {
        return client.sendMessage(jid, {
            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ MÉDIA NON SUPPORTÉ*
┊
*┊Réponds à une image, vidéo,*
*┊audio ou document.*
┊
┊
┊
┊
━━━━━━━━━━━━━❂`
        });
    }

    processing.set(sender, true);

    await client.sendMessage(jid, {
        react: { text: '⏳', key: message.key }
    });

    try {
        const fakeMsg = {
            key:     { ...message.key },
            message: quoted
        };

        const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});

        if (!buffer || buffer.length === 0) {
            throw new Error("Impossible de télécharger le média");
        }

        // ─── Déterminer l'extension ───────────────────────────────────────────
        let extension = 'bin';
        try {
            const type = await fileTypeFromBuffer(buffer);
            extension = type?.ext || 
                quoted.documentMessage?.fileName?.split('.').pop() || 'bin';
        } catch (e) {
            extension = quoted.documentMessage?.fileName?.split('.').pop() || 'bin';
        }

        // ─── Upload ULTRA RAPIDE avec bonne extension ──────────────────────────
        const link = await uploadToCrysnovax(
            buffer,
            `akane_${Date.now()}.${extension}`
        );

        const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

        await client.sendMessage(jid, {
            react: { text: '✅', key: message.key }
        });

        // ─── Image → renvoie l'image + lien + bouton copier ───────────────────
        if (quoted.imageMessage) {
            await client.sendMessage(jid, {
                image:   buffer,
                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ LIEN GÉNÉRÉ !*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 CDN Crysnovax*
*┊⚖️ ${sizeMB} MB*
┊
━━━━━━━━━━━━━❂`,
                nativeFlow: [{
                    text: '📋 Copier le lien',
                    copy: link
                }]
            }, { quoted: message });

        } else if (quoted.videoMessage) {
            await client.sendMessage(jid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ LIEN VIDÉO GÉNÉRÉ !*
┊
*┊🎥 Vidéo • ${sizeMB} MB*
┊
*┊🌐 LIEN :*
┊${link}
┊
*┊📂 CDN Crysnovax*
┊
━━━━━━━━━━━━━❂`,
                nativeFlow: [{
                    text: '📋 Copier le lien',
                    copy: link
                }]
            }, { quoted: message });

        } else if (quoted.audioMessage) {
            await client.sendMessage(jid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ LIEN AUDIO GÉNÉRÉ !*
┊
*┊🎵 Audio • ${sizeMB} MB*
┊
*┊🌐 LIEN :*
┊${link}
┊
*┊📂 CDN Crysnovax*
┊
━━━━━━━━━━━━━❂`,
                nativeFlow: [{
                    text: '📋 Copier le lien',
                    copy: link
                }]
            }, { quoted: message });

        } else {
            await client.sendMessage(jid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ LIEN DOCUMENT GÉNÉRÉ !*
┊
*┊📄 ${quoted.documentMessage?.fileName || `fichier.${extension}`}*
*┊⚖️ ${sizeMB} MB*
┊
*┊🌐 LIEN :*
┊${link}
┊
*┊📂 CDN Crysnovax*
┊
━━━━━━━━━━━━━❂`,
                nativeFlow: [{
                    text: '📋 Copier le lien',
                    copy: link
                }]
            }, { quoted: message });
        }

    } catch (error) {
        console.error('❌ Erreur URL:', error.message);

        await client.sendMessage(jid, {
            react: { text: '❌', key: message.key }
        });

        await client.sendMessage(jid, {
            image: { url: IMG_ERROR },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ÉCHEC DE L'UPLOAD*
┊
*┊🔍 RAISON :*
*┊${error.message}*
┊
*┊💡 Réessaie dans quelques*
*┊secondes.*
┊
━━━━━━━━━━━━━❂`
        });

    } finally {
        processing.delete(sender);
    }
}

export default url;
