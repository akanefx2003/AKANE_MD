// commands/gstatus.js
// @cat: gc-menu

import { downloadMediaMessage, getImageProcessingLibrary } from '@crysnovax/baileys';

const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R";

// ==================== TRAITEMENT IMAGE ====================

async function processImage(buffer) {
    try {
        const lib = await getImageProcessingLibrary();
        if (lib.sharp?.default) {
            return await lib.sharp.default(buffer)
                .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
                .toBuffer();
        }
        if (lib.image?.Transformer) {
            const img = new lib.image.Transformer(buffer);
            return await img.jpeg(100);
        }
        if (lib.jimp?.Jimp) {
            const img = await lib.jimp.Jimp.read(buffer);
            return await img.getBuffer('image/jpeg', { quality: 100 });
        }
        return buffer;
    } catch (e) {
        console.error('[GSTATUS IMAGE]', e.message);
        return buffer;
    }
}

// ==================== TÉLÉCHARGEMENT MÉDIA ====================

async function downloadQuotedMedia(client, message, remoteJid) {
    try {
        const quotedInfo = message.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = quotedInfo?.quotedMessage;
        const participant = quotedInfo?.participant;
        const stanzaId = quotedInfo?.stanzaId;
        if (!quotedMessage) return null;
        const fakeMessage = {
            key: {
                remoteJid,
                fromMe: participant === client.user?.id?.split(':')[0] + '@s.whatsapp.net',
                id: stanzaId,
                participant
            },
            message: quotedMessage
        };
        return await downloadMediaMessage(fakeMessage, 'buffer', {}, {
            logger: { info: () => {}, error: () => {} },
            reuploadRequest: client.updateMediaMessage
        });
    } catch (e) {
        console.error('[GSTATUS DOWNLOAD]', e.message);
        return null;
    }
}

// ==================== SUPPRESSION SILENCIEUSE ====================

async function deleteMsg(client, jid, key) {
    try {
        await client.sendMessage(jid, { delete: key });
    } catch (e) {
        console.error('[GSTATUS DELETE]', e.message);
    }
}

// ==================== COMMANDE PRINCIPALE ====================

export default async function gstatusCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ GROUPES UNIQUEMENT !*
┊
╰─────────────────❂`
        });
    }

    const argsText = args.join(' ').trim();

    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedMtype = quotedMsg ? Object.keys(quotedMsg)[0] : null;
    const quotedStanzaId = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    const quoted = quotedMsg ? {
        mtype: quotedMtype,
        text: quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '',
        caption: quotedMsg?.[quotedMtype]?.caption || '',
        mimetype: quotedMsg?.[quotedMtype]?.mimetype || '',
        fileName: quotedMsg?.[quotedMtype]?.fileName || 'document',
        ptt: quotedMsg?.[quotedMtype]?.ptt || false,
        // ✅ Clé du message cité pour suppression
        key: {
            remoteJid,
            fromMe: quotedParticipant === client.user?.id?.split(':')[0] + '@s.whatsapp.net',
            id: quotedStanzaId,
            participant: quotedParticipant
        }
    } : {};

    // ✅ Supprimer la commande tapée par l'utilisateur
    const deleteCommand = () => deleteMsg(client, remoteJid, message.key);
    // ✅ Supprimer le média cité
    const deleteQuoted = () => quoted.key ? deleteMsg(client, remoteJid, quoted.key) : Promise.resolve();

    const reply = async (txt) => {
        const sent = await client.sendMessage(remoteJid, { text: txt });
        // ✅ Auto-supprimer le message de confirmation après 4 secondes
        setTimeout(() => deleteMsg(client, remoteJid, sent.key), 4000);
        return sent;
    };

    // ========== HELP ==========
    if (!argsText && !quotedMsg) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📸 GROUP STATUS*
┊
*┊📝 UTILISATION :*
┊
*┊▸ gs <texte> | <groupJID>*
*┊▸ gs | <groupJID> (cite un média)*
*┊▸ gs <texte> | all*
*┊▸ gs | all (cite un média)*
┊
*┊💡 EXEMPLES :*
*┊▸ gs Bonjour | all*
*┊▸ gs Promo | 1234@g.us*
┊
*┊DEV : 🍁AKANE🌹*
┊
╰─────────────────❂`
        });
    }

    await client.sendMessage(remoteJid, { react: { text: '📸', key: message.key } });

    // ========== BROADCAST ALL ==========
    if (argsText.includes('|')) {
        const [left, right] = argsText.split('|').map(v => v.trim());

        if (right?.toLowerCase() === 'all') {
            const messageText = left || quoted.text || quoted.caption || '';
            if (!messageText && !quotedMsg) {
                await deleteCommand();
                return reply(
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ MESSAGE MANQUANT !*
┊
*┊Ajoute un texte ou cite un média*
┊
╰─────────────────❂`
                );
            }

            const groups = await client.groupFetchAllParticipating();
            const groupIds = Object.keys(groups);

            if (!groupIds.length) {
                await deleteCommand();
                return reply('`✘ Aucun groupe trouvé`');
            }

            await reply(
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📡 BROADCAST EN COURS...*
┊
*┊📦 ${groupIds.length} groupes ciblés*
┊
╰─────────────────❂`
            );

            let success = 0, failed = 0;

            for (const groupId of groupIds) {
                try {
                    if (quotedMsg && quoted.mtype === 'imageMessage') {
                        const buffer = await downloadQuotedMedia(client, message, remoteJid);
                        if (buffer) {
                            const processed = await processImage(buffer);
                            await client.sendMessage(groupId, { image: processed, caption: messageText });
                        }
                    } else if (quotedMsg && quoted.mtype === 'videoMessage') {
                        const buffer = await downloadQuotedMedia(client, message, remoteJid);
                        if (buffer) await client.sendMessage(groupId, { video: buffer, caption: messageText });
                    } else {
                        await client.sendMessage(groupId, { text: messageText });
                    }
                    success++;
                } catch (_) { failed++; }
                await new Promise(r => setTimeout(r, 600));
            }

            // ✅ Supprimer la commande + média cité après broadcast
            await deleteCommand();
            await deleteQuoted();

            return reply(
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ BROADCAST TERMINÉ !*
┊
*┊✅ Succès : ${success}*
*┊❌ Échecs : ${failed}*
┊
╰─────────────────❂`
            );
        }

        // ========== GROUPE SPÉCIFIQUE ==========
        const messageText = left || '';
        const targetJid = right;

        if (!targetJid?.endsWith('@g.us')) {
            await deleteCommand();
            return reply(
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ JID INVALIDE !*
┊
*┊Format : 1234567890@g.us*
┊
╰─────────────────❂`
            );
        }

        try { await client.groupMetadata(targetJid); }
        catch {
            await deleteCommand();
            return reply('`✘ Le bot n\'est pas dans ce groupe`');
        }

        await sendMedia(client, message, remoteJid, targetJid, messageText, quoted, quotedMsg, reply);
        await deleteCommand();
        await deleteQuoted();
        return;
    }

    // ========== ENVOYER DANS LE GROUPE ACTUEL ==========
    await sendMedia(client, message, remoteJid, remoteJid, argsText, quoted, quotedMsg, reply);
    await deleteCommand();
    await deleteQuoted();
}

// ==================== ENVOI MÉDIA ====================

async function sendMedia(client, message, remoteJid, targetJid, messageText, quoted, quotedMsg, reply) {
    try {
        if (quoted.mtype === 'imageMessage') {
            const buffer = await downloadQuotedMedia(client, message, remoteJid);
            if (!buffer) return reply('`✘ Impossible de télécharger l\'image`');
            const processed = await processImage(buffer);
            await client.sendMessage(targetJid, {
                image: processed,
                caption: messageText || quoted.caption || '',
                groupStatus: true
            });
        } else if (quoted.mtype === 'videoMessage') {
            const buffer = await downloadQuotedMedia(client, message, remoteJid);
            if (!buffer) return reply('`✘ Impossible de télécharger la vidéo`');
            await client.sendMessage(targetJid, {
                video: buffer,
                caption: messageText || quoted.caption || '',
                groupStatus: true
            });
        } else if (quoted.mtype === 'audioMessage') {
            const buffer = await downloadQuotedMedia(client, message, remoteJid);
            if (!buffer) return reply('`✘ Impossible de télécharger l\'audio`');
            await client.sendMessage(targetJid, {
                audio: buffer,
                mimetype: quoted.mimetype || 'audio/mpeg',
                ptt: quoted.ptt || false,
                groupStatus: true
            });
        } else if (quoted.mtype === 'stickerMessage') {
            const buffer = await downloadQuotedMedia(client, message, remoteJid);
            if (!buffer) return reply('`✘ Impossible de télécharger le sticker`');
            await client.sendMessage(targetJid, { sticker: buffer, groupStatus: true });
        } else if (quoted.mtype === 'documentMessage') {
            const buffer = await downloadQuotedMedia(client, message, remoteJid);
            if (!buffer) return reply('`✘ Impossible de télécharger le document`');
            await client.sendMessage(targetJid, {
                document: buffer,
                mimetype: quoted.mimetype,
                fileName: quoted.fileName || 'document',
                caption: messageText,
                groupStatus: true
            });
        } else if (messageText || quoted.text || quoted.caption) {
            await client.sendMessage(targetJid, {
                text: messageText || quoted.text || quoted.caption,
                groupStatus: true
            });
        } else {
            return reply('`✘ Aucun contenu à envoyer`');
        }

        // ✅ Message de confirmation qui s'auto-supprime après 4s
        await reply(
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ PUBLIÉ AVEC SUCCÈS !*
┊
╰─────────────────❂`
        );

    } catch (e) {
        console.error('[GSTATUS SEND]', e.message);
        reply(`\`✘ ${e.message}\``);
    }
}
