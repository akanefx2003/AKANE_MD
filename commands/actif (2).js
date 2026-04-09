// commands/actif.js
// @cat: gc-menu
// Membres les plus actifs d'un groupe

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const MESSAGE_COUNT_FILE = path.join(DATA_DIR, 'messageCount.json');

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';
const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

function loadMessageCount() {
    try {
        if (!fs.existsSync(MESSAGE_COUNT_FILE)) return {};
        return JSON.parse(fs.readFileSync(MESSAGE_COUNT_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveMessageCount(data) {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(MESSAGE_COUNT_FILE, JSON.stringify(data, null, 2));
    } catch (e) {}
}

// Incrémenter le compteur de messages (à appeler dans messageHandler)
export function incrementMessageCount(chatId, senderId) {
    const data = loadMessageCount();
    if (!data[chatId]) data[chatId] = {};
    if (!data[chatId][senderId]) data[chatId][senderId] = 0;
    data[chatId][senderId]++;
    saveMessageCount(data);
}

async function actifCommand(client, message, args) {
    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid.includes('g.us');
    
    if (!isGroup) {
        await client.sendMessage(remoteJid, { text: "❌ *Cette commande n'est disponible que dans les groupes !*" });
        return;
    }
    
    await client.sendMessage(remoteJid, { text: "⏳ *Calcul des membres les plus actifs...*" });
    
    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants;
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const data = loadMessageCount();
        const groupData = data[remoteJid] || {};
        
        const actifs = participants
            .filter(p => p.id !== botJid && groupData[p.id] > 0)
            .map(p => ({
                jid: p.id,
                count: groupData[p.id] || 0,
                isAdmin: !!p.admin
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);
        
        if (actifs.length === 0) {
            await client.sendMessage(remoteJid, { text: "📭 *Aucune activité enregistrée dans ce groupe*" });
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        const mentions = actifs.map(m => m.jid);
        
        let text = `🏆 *MEMBRES LES PLUS ACTIFS*\n\n━━━━━━━━━━━━━━━━━━━━\n`;
        
        actifs.forEach((m, i) => {
            const number = m.jid.split('@')[0];
            const medal = medals[i] || `${i + 1}.`;
            const role = m.isAdmin ? ' 👑' : '';
            text += `${medal} @${number}${role} - *${m.count}* messages\n`;
        });
        
        text += `\n━━━━━━━━━━━━━━━━━━━━\n📊 *Total membres :* ${participants.length}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n📢 *REJOINS MA CHAÎNE* 🔥\n\n*${CHANNEL_NAME}*\n${CHANNEL_LINK}\n\n> *DEV : AKANE KUROGAWA🌹*`;
        
        await client.sendMessage(remoteJid, { text, mentions });
        
    } catch (error) {
        console.error('Erreur actif:', error);
        await client.sendMessage(remoteJid, { text: "❌ *Impossible d'afficher les membres actifs*" });
    }
}

export default actifCommand;