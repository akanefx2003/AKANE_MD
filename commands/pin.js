// commands/pin.js

const IMG_HELP = 'https://raw.githubusercontent.com/toge021/Media/main/c687.jpg';

// ─── Durées disponibles ───────────────────────────────────────────────────────

const DUREES = {
    '1j':  86400,
    '7j':  604800,
    '30j': 2592000,
};

// ─── Commande principale ─────────────────────────────────────────────────────

export async function pinCommand(client, message, args) {

    const jid    = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedKey = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

    // ─── Pas de message cité → aide ──────────────────────────────────────────
    if (!quoted || !quotedKey) {

        return client.sendMessage(jid, {

            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📌 COMMANDE PIN*
┊
*┊⚠️ RÉPONDS À UN MESSAGE*
*┊POUR L'ÉPINGLER !*
┊
*┊⏱️ DURÉES DISPONIBLES :*
*┊▸ .pin 1j → 1 jour*
*┊▸ .pin 7j → 7 jours*
*┊▸ .pin 30j → 30 jours*
*┊▸ .pin (sans durée) → 7j par défaut*
┊
*┊🗑️ POUR DÉSÉPINGLER :*
*┊▸ .unpin (en répondant au message)*
┊
╰─────────────────❂`

        });

    }

    // ─── Durée (défaut 7j) ────────────────────────────────────────────────────
    const dureeArg = args[0]?.toLowerCase();
    const duree    = DUREES[dureeArg] || DUREES['7j'];
    const label    = dureeArg && DUREES[dureeArg] ? dureeArg : '7j';

    // ─── Clé du message cité ──────────────────────────────────────────────────
    const targetKey = {
        remoteJid:   jid,
        id:          quotedKey,
        participant: quotedParticipant || undefined,
        fromMe:      false,
    };

    try {

        await client.sendMessage(jid, {

            pin:  targetKey,
            time: duree,
            type: 1

        });

        await client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📌 MESSAGE ÉPINGLÉ !*
┊
*┊⏱️ DURÉE : ${label}*
┊
*┊💡 TAPE .unpin EN RÉPONDANT*
*┊AU MÊME MESSAGE POUR*
*┊DÉSÉPINGLER.*
┊
╰─────────────────❂`

        }, { quoted: message });

    } catch (error) {

        console.error('❌ Erreur pin:', error.message);

        await client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ÉCHEC DE L'ÉPINGLAGE*
┊
*┊🔍 RAISON :*
*┊${error.message}*
┊
╰─────────────────❂`

        });

    }

}

// ─── Commande unpin ──────────────────────────────────────────────────────────

export async function unpinCommand(client, message) {

    const jid           = message.key.remoteJid;
    const quotedKey     = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

    if (!quotedKey) {

        return client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⚠️ RÉPONDS AU MESSAGE*
*┊ÉPINGLÉ POUR LE RETIRER !*
┊
╰─────────────────❂`

        });

    }

    const targetKey = {
        remoteJid:   jid,
        id:          quotedKey,
        participant: quotedParticipant || undefined,
        fromMe:      false,
    };

    try {

        await client.sendMessage(jid, {

            pin:  targetKey,
            time: 0,
            type: 0

        });

        await client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ MESSAGE DÉSÉPINGLÉ !*
┊
╰─────────────────❂`

        }, { quoted: message });

    } catch (error) {

        console.error('❌ Erreur unpin:', error.message);

        await client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ÉCHEC DU DÉSÉPINGLAGE*
┊
*┊🔍 RAISON :*
*┊${error.message}*
┊
╰─────────────────❂`

        });

    }

}

export default pinCommand;
