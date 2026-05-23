// commands/stickerpack.js

const CHANNEL      = '🍁 𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹';
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

// ─── Sessions en attente de remplissage ───────────────────────────────────────

const sessions = new Map();

// ─── Étapes du formulaire ─────────────────────────────────────────────────────

const STEPS = [

    {
        key:      'title',
        question:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📦 NOUVEAU STICKER PACK*
┊
*┊ÉTAPE 1/5*
┊
*┊🏷️ NOM DU PACK ?*
*┊(ex: HIZURU MINAKATA)*
┊
╰─────────────────❂`
    },

    {
        key:      'subtitle',
        question:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📦 NOUVEAU STICKER PACK*
┊
*┊ÉTAPE 2/5*
┊
*┊✨ SOUS-TITRE DU PACK ?*
*┊(ex: DARK DETECTIVE AURA)*
┊
╰─────────────────❂`
    },

    {
        key:      'anime',
        question:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📦 NOUVEAU STICKER PACK*
┊
*┊ÉTAPE 3/5*
┊
*┊📺 NOM DE L'ANIMÉ ?*
*┊(ex: Summer Time Rendering)*
┊
╰─────────────────❂`
    },

    {
        key:      'perso',
        question:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📦 NOUVEAU STICKER PACK*
┊
*┊ÉTAPE 4/5*
┊
*┊🎭 NOM DU PERSONNAGE ?*
*┊(ex: Hizuru Minakata)*
┊
╰─────────────────❂`
    },

    {
        key:      'style',
        question:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📦 NOUVEAU STICKER PACK*
┊
*┊ÉTAPE 5/5*
┊
*┊💫 STYLE DU PACK ?*
*┊(ex: cool, smart, mysterious aura)*
┊
╰─────────────────❂`
    },

];

// ─── Générer la présentation finale ──────────────────────────────────────────

function buildPresentation(data) {

    return (
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊📦 NEW STICKER PACK*
┊
*┊🌙 ${data.title.toUpperCase()} 🌙*
*┊(ミ★ ${data.subtitle.toUpperCase()} ★彡)*
┊
*┊📺 ANIMÉ : ${data.anime}*
┊
*┊🎭 PERSO : ${data.perso}*
┊
*┊✨ STYLE : ${data.style}*
┊
*┊💖 CHAÎNE :*
*┊${CHANNEL}*
┊
╰─────────────────❂

> *AKANE KUROGAWA 🌹*`
    );

}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function stickerPackCommand(client, message, args) {

    const jid    = message.key.remoteJid;
    const sender = message.key.participant || jid;

    sessions.set(sender, { step: 0, data: {} });

    await client.sendMessage(jid, {

        text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📦 CRÉATEUR DE PRÉSENTATION*
*┊STICKER PACK*
┊
*┊Je vais te poser 5 questions.*
*┊Réponds à chacune pour*
*┊générer ta présentation !*
┊
*┊💡 Tape annuler pour arrêter.*
┊
╰─────────────────❂`

    });

    await new Promise(r => setTimeout(r, 800));

    await client.sendMessage(jid, {

        text: STEPS[0].question

    });

}

// ─── Handler pour intercepter les réponses ────────────────────────────────────

export async function handleStickerPackResponse(client, message) {

    const jid    = message.key.remoteJid;
    const sender = message.key.participant || jid;

    if (!sessions.has(sender)) return false;

    const body = message.message?.conversation
        || message.message?.extendedTextMessage?.text
        || '';

    if (!body.trim()) return false;

    // ── Annulation ──
    if (body.trim().toLowerCase() === 'annuler') {

        sessions.delete(sender);

        await client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ CRÉATION ANNULÉE*
┊
╰─────────────────❂`

        });

        return true;

    }

    const session = sessions.get(sender);
    const step    = STEPS[session.step];

    session.data[step.key] = body.trim();
    session.step++;

    // ── Étape suivante ──
    if (session.step < STEPS.length) {

        await client.sendMessage(jid, {

            text: STEPS[session.step].question

        });

    } else {

        // ── Présentation finale ──
        const presentation = buildPresentation(session.data);

        sessions.delete(sender);

        await client.sendMessage(jid, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ PRÉSENTATION GÉNÉRÉE !*
┊
╰─────────────────❂`

        });

        await new Promise(r => setTimeout(r, 400));

        await client.sendMessage(jid, {

            text:       presentation,
            nativeFlow: [
                {
                    text: '📋 COPIER LA PRÉSENTATION',
                    copy: presentation
                },
                {
                    text: '🔗 VOIR LA CHAÎNE',
                    url:  CHANNEL_LINK
                }
            ]

        });

    }

    return true;

}

export default stickerPackCommand;
