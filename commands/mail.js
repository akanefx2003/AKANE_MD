// commands/mail.js

import axios from 'axios';

const API_BASE = 'https://api.mail.tm';

const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R";

const mailSessions = new Map();

// ==================== CLASSE ====================

class TempMail {

    constructor(email, password, id) {

        this.email = email;

        this.password = password;

        this.id = id;

        this.createdAt = Date.now();

        this.messages = [];

        this.token = null;

    }

    getAge() {

        return Math.floor((Date.now() - this.createdAt) / 60000);

    }

    isExpired() {

        return this.getAge() > 60;

    }

}

// ==================== API ====================

async function createTempEmail() {

    try {

        const domainRes = await axios.get(`${API_BASE}/domains`);

        const domain = domainRes.data['hydra:member'][0].domain;

        const randomName = Math.random().toString(36).substring(2, 12);

        const email = `${randomName}@${domain}`;

        const password = Math.random().toString(36).substring(2, 15);

        const res = await axios.post(`${API_BASE}/accounts`, {

            address: email,

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

            address: email,

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

text:

`📧 EMAIL TEMPORAIRE

📝 Commandes :

• mail gen

• mail inbox

• mail read [num]

• mail info

• mail delete

🔗 Chaîne :

${CHANNEL_LINK}

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

        });

    }

    // ===== GEN =====

    if (['gen','generate','new'].includes(sub)) {

        const old = mailSessions.get(sender);

        if (old && !old.isExpired()) {

            return client.sendMessage(sender, {

text:

`⚠️ Email actif

📧 ${old.email}

⏱ Expire dans ${60 - old.getAge()} minutes`

            });

        }

        await client.sendMessage(sender, { text: "🔄 Création..." });

        const data = await createTempEmail();

        if (!data) {

            return client.sendMessage(sender, { text: "❌ Erreur création" });

        }

        const session = new TempMail(data.email, data.password, data.id);

        mailSessions.set(sender, session);

        return client.sendMessage(sender, {

text:

`✅ EMAIL CRÉÉ

📧 ${data.email}

🔑 ${data.password}

⏳ Durée : 1 heure

📌 Commandes :

mail inbox

mail read 1

🔗 Chaîne :

${CHANNEL_LINK}

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

        });

    }

    // ===== INBOX =====

    if (['inbox','messages','list'].includes(sub)) {

        const s = mailSessions.get(sender);

        if (!s) return client.sendMessage(sender, { text: "❌ Aucun email" });

        if (s.isExpired()) {

            mailSessions.delete(sender);

            return client.sendMessage(sender, { text: "❌ Expiré" });

        }

        await client.sendMessage(sender, { text: "📥 Récupération..." });

        s.messages = [];

        if (!s.token) {

            s.token = await getToken(s.email, s.password);

        }

        const msgs = await getMessages(s.token);

        s.messages = msgs;

        if (!msgs.length) {

            return client.sendMessage(sender, {

text:

`📭 AUCUN MESSAGE

📧 ${s.email}

⏱ Expire dans ${60 - s.getAge()} minutes

📌 Astuce :

1. Envoie un mail

2. Attends

3. Refais mail inbox

💡 Test :

Envoie "TEST" à ${s.email}

🔗 Chaîne :

${CHANNEL_LINK}

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

            });

        }

        let txt = `📥 INBOX (${msgs.length})\n\n`;

        msgs.slice(0,10).forEach((m,i)=>{

            txt += `${i+1}. ${m.subject || 'Sans objet'}\n`;

            txt += `De: ${m.from?.address}\n`;

            txt += `→ mail read ${i+1}\n\n`;

        });

        txt += `🔗 Chaîne :\n${CHANNEL_LINK}\n\nDEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`;

        return client.sendMessage(sender, { text: txt });

    }

    // ===== READ =====

    if (sub === 'read') {

        const num = parseInt(args[1]);

        const s = mailSessions.get(sender);

        if (!s) return client.sendMessage(sender, { text: "❌ Aucun email" });

        if (!s.token) {

            s.token = await getToken(s.email, s.password);

        }

        let msgs = s.messages;

        if (!msgs.length) {

            msgs = await getMessages(s.token);

            s.messages = msgs;

        }

        if (!msgs[num-1]) {

            return client.sendMessage(sender, { text: "❌ Introuvable" });

        }

        const full = await getMessageContent(s.token, msgs[num-1].id);

        let content = full.text || full.html || '';

        if (Array.isArray(content)) content = content[0];

        let otp = content.match(/\b\d{4,8}\b/);

        let otpText = otp ? `\n\n🔐 CODE: ${otp[0]}` : '';

        let clean = content.length > 1500 ? content.slice(0,1500)+'...' : content;

        return client.sendMessage(sender, {

text:

`📧 MESSAGE

De: ${full.from?.address}

Objet: ${full.subject}

${clean}${otpText}

🔗 Chaîne :

${CHANNEL_LINK}

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

        });

    }

    // ===== DELETE =====

    if (['delete','del'].includes(sub)) {

        const s = mailSessions.get(sender);

        if (!s) return client.sendMessage(sender, { text: "❌ Aucun email" });

        mailSessions.delete(sender);

        return client.sendMessage(sender, {

text:

`✅ EMAIL SUPPRIMÉ

📧 ${s.email}

🔗 ${CHANNEL_LINK}

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

        });

    }

    return client.sendMessage(sender, { text: "❌ Commande invalide" });

}