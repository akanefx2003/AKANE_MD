// commands/url.js

import axios from 'axios';
import { downloadMediaMessage } from 'baileys';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

const IMG_HELP  = 'https://raw.githubusercontent.com/toge021/Media/main/c687.jpg';
const IMG_ERROR = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

// ─── Upload vers DevHackers ───────────────────────────────────────────────────

async function uploadToDevHackers(buffer, fileName) {   

    const form = new FormData();

    form.append('file', buffer, { filename: fileName });

    const res = await axios.post(

        'https://devhackers-link-generator.onrender.com/upload',
        form,
        {
            headers: { ...form.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000
        }

    );

    if (res.data && res.data.githubUrl) return res.data.githubUrl;

    if (typeof res.data === 'object') {

        return res.data.url || res.data.shortUrl || JSON.stringify(res.data);

    }

    return res.data.trim();

}

// ─── Verrou anti-bug enchaînement ────────────────────────────────────────────

const processing = new Set();

// ─── Commande principale ─────────────────────────────────────────────────────

export async function url(client, message) {

    const jid    = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;

    // ─── Anti-bug : si déjà en cours pour ce sender ───────────────────────────
    if (processing.has(sender)) {

        return client.sendMessage(jid, {

            text: '⏳ *Patiente, un upload est déjà en cours...*'

        });

    }

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // ─── Pas de média répondu → aide ──────────────────────────────────────────
    if (!quoted) {

        return client.sendMessage(jid, {

            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
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
╰───────────────────❂`

        });

    }

    // ─── Détection du type de média ───────────────────────────────────────────
    const mediaData = quoted.imageMessage
        || quoted.videoMessage
        || quoted.audioMessage
        || quoted.documentMessage;

    if (!mediaData) {

        return client.sendMessage(jid, {

            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊❌ MÉDIA NON SUPPORTÉ*
┊
*┊Réponds à une image, vidéo,*
*┊audio ou document.*
┊
╰───────────────────❂`

        });

    }

    // ─── Traitement ───────────────────────────────────────────────────────────
    processing.add(sender);

    try {

        // ─── Téléchargement du média ──────────────────────────────────────────
        const fakeMsg = {

            key:     { ...message.key },
            message: quoted

        };

        const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});

        if (!buffer || buffer.length === 0) throw new Error("Impossible de télécharger le média");

        const type      = await fileTypeFromBuffer(buffer);
        const extension = type?.ext
            || quoted.documentMessage?.fileName?.split('.').pop()
            || 'bin';

        const fileName = `akane_${Date.now()}.${extension}`;
        const sizeMB   = (buffer.length / 1024 / 1024).toFixed(2);

        const link = await uploadToDevHackers(buffer, fileName);

        // ─── Image → renvoie l'image originale avec caption ───────────────────
        if (quoted.imageMessage) {

            await client.sendMessage(jid, {

                image:   buffer,
                caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊✅ LIEN GÉNÉRÉ AVEC SUCCÈS !*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 HÉBERGEUR : DevHackers*
*┊⚖️ TAILLE : ${sizeMB} MB*
┊
╰───────────────────❂`

            }, { quoted: message });

        // ─── Vidéo / Audio / Document → lien + caption uniquement ────────────
        } else if (quoted.videoMessage) {

            await client.sendMessage(jid, {

                text:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊✅ LIEN VIDÉO GÉNÉRÉ !*
┊
*┊🎥 TYPE : Vidéo*
*┊⚖️ TAILLE : ${sizeMB} MB*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 HÉBERGEUR : DevHackers*
┊
╰───────────────────❂`

            }, { quoted: message });

        } else if (quoted.audioMessage) {

            await client.sendMessage(jid, {

                text:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊✅ LIEN AUDIO GÉNÉRÉ !*
┊
*┊🎵 TYPE : Audio*
*┊⚖️ TAILLE : ${sizeMB} MB*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 HÉBERGEUR : DevHackers*
┊
╰───────────────────❂`

            }, { quoted: message });

        } else {

            await client.sendMessage(jid, {

                text:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊✅ LIEN DOCUMENT GÉNÉRÉ !*
┊
*┊📄 FICHIER : ${quoted.documentMessage?.fileName || fileName}*
*┊⚖️ TAILLE : ${sizeMB} MB*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 HÉBERGEUR : DevHackers*
┊
╰───────────────────❂`

            }, { quoted: message });

        }

    } catch (error) {

        console.error('❌ Erreur URL:', error.message);

        await client.sendMessage(jid, {

            image: { url: IMG_ERROR },
            caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊❌ ÉCHEC DE L'UPLOAD*
┊
*┊🔍 RAISON :*
*┊${error.message}*
┊
*┊💡 Réessaie dans quelques*
*┊secondes.*
┊
╰───────────────────❂`

        });

    } finally {

        processing.delete(sender);

    }

}

export default url;
