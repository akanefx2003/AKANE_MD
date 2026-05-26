// commands/mail.js

import axios from 'axios';

const API_BASE    = 'https://api.mail.tm';
const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R";

const IMG_HELP   = 'https://raw.githubusercontent.com/toge021/Media/main/f216.jpg';
const IMG_GEN    = 'https://raw.githubusercontent.com/toge021/Media/main/cacd.jpg';
const IMG_INBOX  = 'https://raw.githubusercontent.com/toge021/Media/main/9293.jpg';
const IMG_DELETE = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

const mailSessions = new Map();

// ==================== CLASSE ====================

class TempMail {

    constructor(email, password, id) {
        this.email     = email;
        this.password  = password;
        this.id        = id;
        this.createdAt = Date.now();
        this.messages  = [];
        this.token     = null;
    }

    getAge() {
        return Math.floor((Date.now() - this.createdAt) / 60000);
    }

    isExpired() {
        return this.getAge() > 60;
    }

}

// ==================== EXTRACTION DE CODES ====================

function extractMainCode(text) {
    const codes = [];
    
    const otpRegex = /\b\d{4,8}\b/g;
    const otpMatches = text.match(otpRegex) || [];
    
    if (otpMatches.length > 0) {
        const firstOtp = otpMatches[0];
        if (!firstOtp.startsWith('20') && !firstOtp.startsWith('19')) {
            codes.push({ type: 'OTP', value: firstOtp, emoji: '🔐' });
            return codes;
        }
    }
    
    const alphaRegex = /\b[A-Z]{4,10}\b/g;
    const alphaMatches = text.match(alphaRegex) || [];
    if (alphaMatches.length > 0) {
        const firstAlpha = alphaMatches[0];
        codes.push({ type: 'CODE', value: firstAlpha, emoji: '📝' });
        return codes;
    }
    
    if (otpMatches.length > 0) {
        codes.push({ type: 'OTP', value: otpMatches[0], emoji: '🔐' });
    }
    
    return codes;
}

// ==================== API ====================

async function createTempEmail() {

    try {

        const domainRes = await axios.get(`${API_BASE}/domains`);

        const domain = domainRes.data['hydra:member'][0].domain;

        const randomName = Math.random().toString(36).substring(2, 12);

        const email    = `${randomName}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        const res = await axios.post(`${API_BASE}/accounts`, {

            address:  email,
            password: password

        });

        if (res.data?.id) return { email, password, id: res.data.id };

        return null;

    } catch (e) {

        console.error("Erreur mail:", e.response?.data || e.message);

        return null;

    }

}

async function getToken(email, password) {

    try {

        const res = await axios.post(`${API_BASE}/token`, {

            address:  email,
            password: password

        });

        return res.data.token;

    } catch {

        return null;

    }

}

async function getMessages(token) {

    try {

        const res = await axios.get(`${API_BASE}/messages`, {

            headers: { Authorization: `Bearer ${token}` }

        });

        let messages = res.data['hydra:member'] || [];

        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return messages;

    } catch {

        return [];

    }

}

async function getMessageContent(token, id) {

    try {

        const res = await axios.get(`${API_BASE}/messages/${id}`, {

            headers: { Authorization: `Bearer ${token}` }

        });

        return res.data;

    } catch {

        return null;

    }

}

// ==================== COMMANDE ====================

export default async function mailCommand(client, message, args) {

    const sender = message.key.participant || message.key.remoteJid;

    const sub = args[0]?.toLowerCase();

    // ===== HELP =====

    if (!sub || sub === 'help') {

        return client.sendMessage(sender, {

            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📧 EMAIL TEMPORAIRE*
┊
*┊📝 COMMANDES :*
┊
*┊▸ mail gen*
*┊▸ mail inbox*
*┊▸ mail read [num]*
*┊▸ mail delete*
┊
*┊📢 REJOINS MA CHAINE 🔥*
*┊${CHANNEL_LINK}*
┊
*┊DEV : 🍁AKANE🌹*
┊
━━━━━━━━━━━━━❂`

        });

    }

    // ===== GEN =====

    if (['gen', 'generate', 'new'].includes(sub)) {

        const old = mailSessions.get(sender);

        if (old && !old.isExpired()) {

            return client.sendMessage(sender, {

                image: { url: IMG_GEN },
                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⚠️ EMAIL DÉJÀ ACTIF !*
┊
*┊📧 ${old.email}*
┊
*┊⏱️ EXPIRE DANS ${60 - old.getAge()}m*
┊
━━━━━━━━━━━━━❂`

            });

        }

        await client.sendMessage(sender, { text: "🔄 *Création en cours...*" });

        const data = await createTempEmail();

        if (!data) {

            return client.sendMessage(sender, { text: "❌ *Erreur lors de la création*" });

        }

        const session = new TempMail(data.email, data.password, data.id);

        mailSessions.set(sender, session);

        return client.sendMessage(sender, {

            image: { url: IMG_GEN },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ EMAIL CRÉÉ !*
┊
*┊📧 ${data.email}*
*┊🔑 ${data.password}*
┊
*┊⏳ DURÉE : 1 HEURE*
┊
*┊COMMANDES :*
*┊▸ mail inbox*
*┊▸ mail read 1*
┊
━━━━━━━━━━━━━❂`,
            nativeFlow: [
                {
                    text: '📧 Copier email',
                    copy: data.email
                },
                {
                    text: '🔑 Copier password',
                    copy: data.password
                }
            ]

        });

    }

    // ===== INBOX =====

    if (['inbox', 'messages', 'list'].includes(sub)) {

        const s = mailSessions.get(sender);

        if (!s) {

            return client.sendMessage(sender, { text: "❌ *Aucun email actif. Fais mail gen d'abord.*" });

        }

        if (s.isExpired()) {

            mailSessions.delete(sender);

            return client.sendMessage(sender, { text: "❌ *Email expiré. Fais mail gen.*" });

        }

        await client.sendMessage(sender, { text: "📥 *Récupération...*" });

        s.messages = [];

        if (!s.token) {

            s.token = await getToken(s.email, s.password);

        }

        const msgs = await getMessages(s.token);

        s.messages = msgs;

        if (!msgs.length) {

            return client.sendMessage(sender, {

                image: { url: IMG_INBOX },
                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📭 AUCUN MESSAGE*
┊
*┊📧 ${s.email}*
┊
*┊⏱️ EXPIRE DANS ${60 - s.getAge()}m*
┊
*┊💡 ASTUCE :*
*┊Envoie un mail à l'adresse*
*┊puis fais mail inbox*
┊
━━━━━━━━━━━━━❂`

            });

        }

        let lines = `╭─✧🌹━━━━━━━━━━━━━❂\n┊\n*┊📥 INBOX (${msgs.length})*\n┊\n`;

        msgs.slice(0, 10).forEach((m, i) => {

            lines += `*┊${i + 1}. ${m.subject || 'Sans objet'}*\n`;
            lines += `*┊   De : ${m.from?.address}*\n`;
            lines += `*┊   → mail read ${i + 1}*\n┊\n`;

        });

        lines += `━━━━━━━━━━━━━❂`;

        return client.sendMessage(sender, {

            image: { url: IMG_INBOX },
            caption: lines

        });

    }

    // ===== READ =====

    if (sub === 'read') {

        const num = parseInt(args[1]);

        const s = mailSessions.get(sender);

        if (!s) {

            return client.sendMessage(sender, { text: "❌ *Aucun email actif.*" });

        }

        if (!s.token) {

            s.token = await getToken(s.email, s.password);

        }

        let msgs = s.messages;

        if (!msgs.length) {

            msgs = await getMessages(s.token);

            s.messages = msgs;

        }

        if (!msgs[num - 1]) {

            return client.sendMessage(sender, { text: "❌ *Message introuvable.*" });

        }

        const full = await getMessageContent(s.token, msgs[num - 1].id);

        let content = full.text || full.html || '';

        if (Array.isArray(content)) content = content[0];

        // ─── EXTRACTION DU CODE PRINCIPAL ───────────────────────────────────
        const codes = extractMainCode(content);
        
        let clean   = content.length > 1000 ? content.slice(0, 1000) + '...' : content;
        let codesText = '';
        let nativeFlows = [];

        // Afficher SEULEMENT le code principal extrait
        if (codes.length > 0) {
            const mainCode = codes[0];
            codesText = `\n┊\n*┊🔑 ${mainCode.type} : ${mainCode.value}*`;
            nativeFlows.push({
                text: `${mainCode.emoji} Copier ${mainCode.type}`,
                copy: mainCode.value
            });
        }

        return client.sendMessage(sender, {

            image: { url: IMG_INBOX },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📧 MESSAGE #${num}*
┊
*┊DE : ${full.from?.address}*
*┊OBJET : ${full.subject}*
┊
${clean}${codesText}
┊
━━━━━━━━━━━━━❂`,
            ...(nativeFlows.length > 0 && { nativeFlow: nativeFlows })

        });

    }

    // ===== DELETE =====

    if (['delete', 'del'].includes(sub)) {

        const s = mailSessions.get(sender);

        if (!s) {

            return client.sendMessage(sender, { text: "❌ *Aucun email actif.*" });

        }

        mailSessions.delete(sender);

        return client.sendMessage(sender, {

            image: { url: IMG_DELETE },
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ EMAIL SUPPRIMÉ !*
┊
*┊📧 ${s.email}*
┊
*┊💡 FAIS mail gen*
*┊   POUR EN CRÉER UN*
┊
━━━━━━━━━━━━━❂`

        });

    }

    return client.sendMessage(sender, { text: "❌ *Commande invalide. Fais mail help.*" });

}
