// akane/ai.js

// Système IA — détecte l'intention et dispatch vers la bonne commande

import configmanager from '../utils/configmanager.js';

import * as setModule from '../commands/set.js';

import * as mailModule from '../commands/mail.js';

import * as silenceModule from '../commands/silence.js';

import * as songModule from '../commands/song.js';

import * as menuModule from '../commands/menu.js';

const GROQ_API_KEY = 'y';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Anti-spam : dernière réponse par utilisateur

const lastResponseTime = new Map();

const INTENT_MAP = {

    setprefix: { module: 'configDirect' },

    setreaction: { module: 'configDirect' },

    setwelcome_on: { module: 'configDirect' },

    setwelcome_off: { module: 'configDirect' },

    autorecord_on: { module: 'configDirect' },

    autorecord_off: { module: 'configDirect' },

    autotype_on: { module: 'configDirect' },

    autotype_off: { module: 'configDirect' },

    public_on: { module: 'configDirect' },

    public_off: { module: 'configDirect' },

    mail_gen: { module: 'mail', fn: 'default', args: ['gen'] },

    mail_inbox: { module: 'mail', fn: 'default', args: ['inbox'] },

    mail_read: { module: 'mail', fn: 'default', args: ['read'] },

    mail_delete: { module: 'mail', fn: 'default', args: ['delete'] },

    mute: { module: 'silence', fn: 'default' },

    song: { module: 'song', fn: 'default' },

    menu: { module: 'menu', fn: 'default' },

};

const SYSTEM_PROMPT = `Tu es l'IA d'AKANE MD. Retourne UNIQUEMENT ce JSON:

{"intent":"intention","value":"valeur","confidence":0.9,"reply":"réponse courte"}

Intentions: setprefix, setreaction, setwelcome_on, setwelcome_off, autorecord_on, autorecord_off, autotype_on, autotype_off, public_on, public_off, mail_gen, mail_inbox, mail_read, mail_delete, mute, song, menu, unknown`;

async function detectIntent(userMessage) {

    try {

        const res = await fetch(GROQ_API_URL, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json',

                'Authorization': `Bearer ${GROQ_API_KEY}`

            },

            body: JSON.stringify({

                model: GROQ_MODEL,

                max_tokens: 200,

                temperature: 0.1,

                messages: [

                    { role: 'system', content: SYSTEM_PROMPT },

                    { role: 'user', content: userMessage }

                ]

            })

        });

        const data = await res.json();

        if (!res.ok || data.error) throw new Error(data.error?.message);

        const raw = data.choices?.[0]?.message?.content?.trim() || '{}';

        const clean = raw.replace(/```json|```/g, '').trim();

        return JSON.parse(clean);

    } catch (e) {

        console.error('❌ Groq error:', e.message);

        return { intent: 'unknown', value: null, confidence: 0, reply: null };

    }

}

async function dispatchIntent(intent, value, originalMessage, sock) {

    const mapping = INTENT_MAP[intent];

    if (!mapping) return false;

    const number = sock.user.id.split(':')[0];

    const prefix = configmanager.config.users?.[number]?.prefix || '.';

    const remoteJid = originalMessage.key.remoteJid;

    if (mapping.module === 'configDirect') {

        const cfg = configmanager.config.users[number];

        if (!cfg) return false;

        switch (intent) {

            case 'public_on':

                cfg.publicMode = true;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '🌍 *Mode public activé !*' });

                return true;

            case 'public_off':

                cfg.publicMode = false;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '🔒 *Mode public désactivé !*' });

                return true;

            case 'setwelcome_on':

                cfg.welcome = true;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '👋 *Welcome activé !*' });

                return true;

            case 'setwelcome_off':

                cfg.welcome = false;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '👋 *Welcome désactivé !*' });

                return true;

            case 'autorecord_on':

                cfg.record = true;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '🎙️ *Autorecord activé !*' });

                return true;

            case 'autorecord_off':

                cfg.record = false;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '🎙️ *Autorecord désactivé !*' });

                return true;

            case 'autotype_on':

                cfg.type = true;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '⌨️ *Autotype activé !*' });

                return true;

            case 'autotype_off':

                cfg.type = false;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: '⌨️ *Autotype désactivé !*' });

                return true;

            case 'setprefix':

                if (!value) return false;

                cfg.prefix = value;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: `✅ *Préfixe changé en :* ${value}` });

                return true;

            case 'setreaction':

                if (!value) return false;

                cfg.reaction = value;

                configmanager.save();

                await sock.sendMessage(remoteJid, { text: `✅ *Réaction changée en :* ${value}` });

                return true;

            default:

                return false;

        }

    }

    // Module externe

    let module;

    switch (mapping.module) {

        case 'mail': module = mailModule; break;

        case 'silence': module = silenceModule; break;

        case 'song': module = songModule; break;

        case 'menu': module = menuModule; break;

        case 'set': module = setModule; break;

        default: return false;

    }

    const fn = module[mapping.fn] || module.default;

    if (typeof fn !== 'function') return false;

    try {

        if (mapping.args) {

            await fn(sock, originalMessage, mapping.args);

        } else if (intent === 'song' && value) {

            await fn(sock, originalMessage, value.split(' '));

        } else if (intent === 'mail_read' && value) {

            await fn(sock, originalMessage, ['read', value]);

        } else {

            await fn(sock, originalMessage);

        }

        return true;

    } catch (e) {

        console.error(`❌ Erreur dispatch ${intent}:`, e.message);

        return false;

    }

}

export async function handleAIMessage(sock, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) return;

        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

        if (!body.trim() || body.length < 3) return;

        const number = sock.user.id.split(':')[0];

        const userConfig = configmanager.config.users?.[number];

        

        // ✅ Vérifier si mode IA activé

        if (!userConfig?.aiMode) return;

        // ✅ Ignorer les commandes avec préfixe

        const prefix = userConfig?.prefix || '.';

        if (body.trim().startsWith(prefix)) return;

        // ✅ Éviter les boucles et réponses automatiques

        const ignorePatterns = ['❌', '✅', '🤖', '╔', '╭', '┌', '🔴', '🟢', '⬇️', '⏳'];

        if (ignorePatterns.some(p => body.trim().startsWith(p))) return;

        // ✅ Anti-spam : 5 secondes minimum entre deux réponses

        const now = Date.now();

        const lastTime = lastResponseTime.get(remoteJid) || 0;

        if (now - lastTime < 5000) return;

        lastResponseTime.set(remoteJid, now);

        // ✅ Vérifier que c'est le owner

        const senderJid = message.key.participant || message.key.remoteJid;

        const senderNumber = senderJid?.split('@')[0]?.split(':')[0];

        const isFromMe = message.key.fromMe;

        const isOwner = senderNumber === number || isFromMe;

        if (!isOwner) return;

        console.log(`🤖 IA: "${body.substring(0, 50)}"`);

        

        const result = await detectIntent(body);

        console.log(`🎯 Intent: ${result.intent}`);

        if (result.intent === 'unknown') {

            if (result.reply && result.reply.length > 2) {

                await sock.sendMessage(remoteJid, { text: result.reply });

            }

            return;

        }

        if (result.reply) {

            await sock.sendMessage(remoteJid, { text: result.reply });

        }

        await dispatchIntent(result.intent, result.value, message, sock);

    } catch (e) {

        console.error('❌ handleAIMessage:', e.message);

    }

}

export async function setAIMode(message, sock) {

    try {

        const number = sock.user.id.split(':')[0];

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) return;

        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

        const prefix = configmanager.config.users?.[number]?.prefix || '.';

        const arg = body.slice(prefix.length).trim().split(/\s+/)[1]?.toLowerCase();

        if (!configmanager.config.users[number]) {

            configmanager.config.users[number] = {};

        }

        if (arg === 'on') {

            configmanager.config.users[number].aiMode = true;

            configmanager.save();

            await sock.sendMessage(remoteJid, { text: '✅ *Mode IA activé !*\n\n🤖 Parle-moi naturellement sans préfixe.' });

        } else if (arg === 'off') {

            configmanager.config.users[number].aiMode = false;

            configmanager.save();

            await sock.sendMessage(remoteJid, { text: '❌ *Mode IA désactivé !*\n\n🔹 Utilise le préfixe pour les commandes.' });

        } else {

            const status = configmanager.config.users[number]?.aiMode ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';

            await sock.sendMessage(remoteJid, { text: `🤖 *Mode IA :* ${status}\n\n📝 *.ai on* → activer\n📝 *.ai off* → désactiver` });

        }

    } catch (e) {

        console.error('❌ setAIMode:', e.message);

        await sock.sendMessage(message.key.remoteJid, { text: '❌ *Erreur lors du changement de mode IA*' });

    }

}

export default { handleAIMessage, setAIMode };