// commands/url.js

import axios from 'axios';
import { downloadMediaMessage } from '@crysnovax/baileys';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

const IMG_HELP  = 'https://raw.githubusercontent.com/toge021/Media/main/c687.jpg';
const IMG_ERROR = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

// ─── Cadre uniforme ───────────────────────────────────────────────────────────
// ╭─✧🌹━━━━━━━━━━━━━━━━━━━❂  ← haut
// ╰───────────────────────❂  ← bas (même longueur)

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
            maxBodyLength:    Infinity,
            timeout:          60000
        }

    );

    if (res.data?.githubUrl) return res.data.githubUrl;

    if (typeof res.data === 'object') {

        return res.data.url || res.data.shortUrl || JSON.stringify(res.data);

    }

    return res.data.trim();

}

// ─── Verrou par sender (permet l'enchaînement entre différents users) ─────────

const processing = new Map();

// ─── Commande principale ─────────────────────────────────────────────────────

export async function url(client, message) {

    const jid    = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;

    // ─── Si ce sender a déjà un upload en cours → on laisse passer
    //     mais on prévient. Deux uploads simultanés du MÊME sender → bloqué.
    if (processing.get(sender)) {

        return client.sendMessage(jid, {

            text: '⏳ *Ton upload est déjà en cours, patiente...*'

        });

    }

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // ─── Pas de média → aide ──────────────────────────────────────────────────
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
╰─────────────────❂`

        });

    }

    // ─── Type de média ────────────────────────────────────────────────────────
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
╰─────────────────❂`

        });

    }

    // ─── Marquer ce sender comme en cours ────────────────────────────────────
    processing.set(sender, true);

    // ─── Message d'attente (réaction visuelle) ────────────────────────────────
    await client.sendMessage(jid, {

        react: { text: '⏳', key: message.key }

    });

    try {

        // ─── Téléchargement en parallèle avec l'upload ────────────────────────
        const fakeMsg = {

            key:     { ...message.key },
            message: quoted

        };

        // Télécharge le buffer
        const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});

        if (!buffer || buffer.length === 0) throw new Error("Impossible de télécharger le média");

        // Détection type + upload en parallèle
        const [type, link] = await Promise.all([

            fileTypeFromBuffer(buffer),
            uploadToDevHackers(
                buffer,
                `akane_${Date.now()}.tmp`
            )

        ]);

        const extension = type?.ext
            || quoted.documentMessage?.fileName?.split('.').pop()
            || 'bin';

        const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

        // ─── Réaction succès ──────────────────────────────────────────────────
        await client.sendMessage(jid, {

            react: { text: '✅', key: message.key }

        });

        // ─── Image → renvoie l'image + lien ───────────────────────────────────
        if (quoted.imageMessage) {

            await client.sendMessage(jid, {

                image:   buffer,
                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ LIEN GÉNÉRÉ AVEC SUCCÈS !*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 HÉBERGEUR : DevHackers*
*┊⚖️ TAILLE : ${sizeMB} MB*
┊
╰─────────────────❂`

            }, { quoted: message });

        // ─── Vidéo → texte uniquement ─────────────────────────────────────────
        } else if (quoted.videoMessage) {

            await client.sendMessage(jid, {

                text:
`╭─✧🌹━━━━━━━━━━━━━❂
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
╰─────────────────❂`

            }, { quoted: message });

        // ─── Audio → texte uniquement ─────────────────────────────────────────
        } else if (quoted.audioMessage) {

            await client.sendMessage(jid, {

                text:
`╭─✧🌹━━━━━━━━━━━━❂
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
╰─────────────────❂`

            }, { quoted: message });

        // ─── Document → texte uniquement ──────────────────────────────────────
        } else {

            await client.sendMessage(jid, {

                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ LIEN DOCUMENT GÉNÉRÉ !*
┊
*┊📄 ${quoted.documentMessage?.fileName || `fichier.${extension}`}*
*┊⚖️ TAILLE : ${sizeMB} MB*
┊
*┊🌐 LIEN DIRECT :*
┊${link}
┊
*┊📂 HÉBERGEUR : DevHackers*
┊
╰─────────────────❂`

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
╰─────────────────❂`

        });

    } finally {

        // ─── Libère le verrou → enchaînement possible ─────────────────────────
        processing.delete(sender);

    }

}

export default url;
