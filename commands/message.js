// commands/message.js

// @cat: bot-menu

// Commande pour programmer des messages - Version corrigée

import fs from 'fs/promises';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

const SCHEDULE_FILE = path.join(DATA_DIR, 'scheduled_messages.json');

let scheduledMessages = new Map();

let checkInterval = null;

let cleanupInterval = null;

// ==================== FONCTIONS DE STOCKAGE ====================

async function ensureDataDir() {

    try {

        await fs.access(DATA_DIR);

    } catch {

        await fs.mkdir(DATA_DIR, { recursive: true });

        console.log("📁 Dossier data créé");

    }

}

async function loadScheduledMessages() {

    await ensureDataDir();

    try {

        const data = await fs.readFile(SCHEDULE_FILE, 'utf-8');

        const messages = JSON.parse(data);

        scheduledMessages = new Map(Object.entries(messages));

        console.log(`📋 ${scheduledMessages.size} messages programmés chargés`);

    } catch (error) {

        console.log("📭 Aucun message programmé trouvé");

        await saveScheduledMessages();

    }

}

async function saveScheduledMessages() {

    await ensureDataDir();

    const obj = Object.fromEntries(scheduledMessages);

    await fs.writeFile(SCHEDULE_FILE, JSON.stringify(obj, null, 2));

}

// ==================== NETTOYAGE DES MESSAGES ENVOYÉS (APRÈS 24H) ====================

async function cleanupSentMessages() {

    const now = Date.now();

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    let hasChanges = false;

    

    for (const [id, schedule] of scheduledMessages) {

        // Si le message est envoyé et a plus de 24h, on le supprime

        if (schedule.sent && schedule.sentAt && (now - schedule.sentAt) > TWENTY_FOUR_HOURS) {

            scheduledMessages.delete(id);

            hasChanges = true;

            console.log(`🗑️ Message supprimé (envoyé il y a plus de 24h): ${id}`);

        }

    }

    

    if (hasChanges) {

        await saveScheduledMessages();

    }

}

function startCleanup() {

    if (cleanupInterval) clearInterval(cleanupInterval);

    // Nettoyer toutes les heures

    cleanupInterval = setInterval(() => cleanupSentMessages(), 60 * 60 * 1000);

    console.log("🧹 Nettoyage automatique démarré (messages supprimés après 24h)");

}

// ==================== FONCTION POUR NETTOYER LE NUMÉRO ====================

function cleanPhoneNumber(number) {

    return number.replace(/[^0-9]/g, '');

}

// ==================== FONCTION POUR EXTRAIRE L'ID DU GROUPE ====================

function extractGroupId(link) {

    const match = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);

    if (match) {

        return match[1];

    }

    return null;

}

function extractGroupInvite(link) {

    const match = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);

    if (match) {

        return match[1];

    }

    return null;

}

// ==================== VÉRIFICATION ET ENVOI ====================

async function checkScheduledMessages(client) {

    const now = Date.now();

    let hasChanges = false;

    

    for (const [id, schedule] of scheduledMessages) {

        // Vérifier si le message doit être envoyé

        if (!schedule.sent && schedule.time <= now) {

            try {

                let targetJid = schedule.target;

                

                // Si c'est un lien de groupe

                if (schedule.isGroupLink && schedule.groupInvite) {

                    try {

                        await client.groupAcceptInvite(schedule.groupInvite);

                        console.log(`🔗 Rejoint le groupe avec l'invitation: ${schedule.groupInvite}`);

                        await new Promise(resolve => setTimeout(resolve, 2000));

                        const chats = await client.groupFetchAllParticipating();

                        for (const [jid, chat] of Object.entries(chats)) {

                            if (chat.subject === schedule.groupName || jid.includes(schedule.groupInvite)) {

                                targetJid = jid;

                                break;

                            }

                        }

                    } catch (err) {

                        console.log("Impossible de rejoindre le groupe");

                    }

                }

                

                await client.sendMessage(targetJid, { text: schedule.message });

                schedule.sent = true;

                schedule.sentAt = now;

                hasChanges = true;

                console.log(`✅ Message envoyé à ${schedule.target} à ${new Date(now).toLocaleString()}`);

            } catch (error) {

                console.error(`❌ Erreur envoi message à ${schedule.target}:`, error.message);

            }

        }

    }

    

    if (hasChanges) {

        await saveScheduledMessages();

    }

}

function startScheduler(client) {

    if (checkInterval) clearInterval(checkInterval);

    checkInterval = setInterval(() => checkScheduledMessages(client), 10000);

    console.log("⏰ Scheduler démarré (vérification toutes les 10 secondes)");

}

// ==================== FONCTION POUR CALCULER LA DATE CIBLE ====================

function calculateTargetDate(dateStr, timeStr) {

    const now = new Date();

    let targetDate;

    

    if (dateStr) {

        const parts = dateStr.split('/');

        const day = parseInt(parts[0]);

        const month = parseInt(parts[1]) - 1;

        let year = now.getFullYear();

        

        if (parts.length === 3) {

            year = parseInt(parts[2]);

        } else {

            // Si la date est déjà passée cette année, on prend l'année prochaine

            const tempDate = new Date(year, month, day);

            if (tempDate < now) {

                year++;

            }

        }

        

        targetDate = new Date(year, month, day);

    } else {

        targetDate = new Date();

    }

    

    const [hours, minutes] = timeStr.split(':');

    targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    

    // Si la date est déjà passée, ajouter 7 jours

    if (targetDate <= now) {

        targetDate.setDate(targetDate.getDate() + 7);

    }

    

    return targetDate;

}

// ==================== COMMANDE PRINCIPALE ====================

async function messageCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const subCommand = args[0]?.toLowerCase();

    

    if (!checkInterval) startScheduler(client);

    if (!cleanupInterval) startCleanup();

    await loadScheduledMessages();

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`📅 *MESSAGE PROGRAMMÉ*

📝 *COMMANDES :*

• *message [numéro/groupe] [heure] [message]* - Programmer un message

• *message [numéro/groupe] [date] [heure] [message]* - Programmer avec date

• *message list* - Voir les messages programmés

• *message cancel [id]* - Annuler un message

• *message clear* - Tout annuler

💡 *EXEMPLES :*

• *message +221705928204 20:15 Salut !*

• *message +225794995527673 23/03 20:15 Bonjour !*

• *message 23/03 20:15 Message pour aujourd'hui*

• *message https://chat.whatsapp.com/xxxxx 14:30 Réunion*

• *message list*

📅 *FORMAT DATE :* JJ/MM ou JJ/MM/AAAA

⏰ *FORMAT HEURE :* HH:MM (24h)

ℹ️ *INFO :* Les messages envoyés sont automatiquement supprimés après 24h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹

https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // ========== LISTER LES MESSAGES ==========

    if (subCommand === 'list') {

        if (scheduledMessages.size === 0) {

            await client.sendMessage(remoteJid, { text: "📭 *Aucun message programmé*" });

            return;

        }

        

        let listText = `📅 *MESSAGES PROGRAMMÉS*\n\n━━━━━━━━━━━━━━━━━━━━\n`;

        let index = 1;

        for (const [id, schedule] of scheduledMessages) {

            const date = new Date(schedule.time);

            const timeStr = date.toLocaleString('fr-FR');

            const status = schedule.sent ? "✅ Envoyé" : "⏳ En attente";

            let targetDisplay = schedule.originalTarget || schedule.target;

            if (targetDisplay.includes('@s.whatsapp.net') && !targetDisplay.includes('g.us')) {

                targetDisplay = targetDisplay.replace('@s.whatsapp.net', '');

                targetDisplay = `+${targetDisplay}`;

            } else if (targetDisplay.includes('g.us')) {

                targetDisplay = "Groupe WhatsApp";

            }

            listText += `*${index}.* 📝 *Message :* ${schedule.message}\n`;

            listText += `   📱 *Vers :* ${targetDisplay}\n`;

            listText += `   🕐 *À :* ${timeStr}\n`;

            listText += `   📊 *Statut :* ${status}\n`;

            if (schedule.sent && schedule.sentAt) {

                const sentDate = new Date(schedule.sentAt);

                listText += `   ✅ *Envoyé le :* ${sentDate.toLocaleString('fr-FR')}\n`;

            }

            listText += `   🔢 *ID :* \`${id}\`\n\n`;

            index++;

        }

        listText += `━━━━━━━━━━━━━━━━━━━━\n💡 Utilise *message cancel [id]* pour annuler\n🗑️ *Les messages envoyés sont supprimés après 24h*`;

        

        await client.sendMessage(remoteJid, { text: listText });

        return;

    }

    

    // ========== ANNULER UN MESSAGE ==========

    if (subCommand === 'cancel') {

        const msgId = args[1];

        if (!msgId || !scheduledMessages.has(msgId)) {

            await client.sendMessage(remoteJid, { text: "❌ *ID invalide*\n\nUtilise *message list* pour voir les IDs" });

            return;

        }

        

        const schedule = scheduledMessages.get(msgId);

        scheduledMessages.delete(msgId);

        await saveScheduledMessages();

        await client.sendMessage(remoteJid, { text: `✅ *Message annulé !*\n\n📝 ${schedule.message.substring(0, 50)}...\n📱 Vers : ${schedule.originalTarget || schedule.target}` });

        return;

    }

    

    // ========== TOUT ANNULER ==========

    if (subCommand === 'clear') {

        const count = scheduledMessages.size;

        scheduledMessages.clear();

        await saveScheduledMessages();

        await client.sendMessage(remoteJid, { text: `🗑️ *${count} message(s) programmé(s) annulé(s) !*` });

        return;

    }

    

    // ========== PROGRAMMER UN MESSAGE ==========

    let target, dateStr, timeStr, messageText;

    

    const secondArg = args[1];

    const isDate = secondArg && /^\d{1,2}\/\d{1,2}(\/\d{4})?$/.test(secondArg);

    

    if (isDate) {

        target = args[0];

        dateStr = args[1];

        timeStr = args[2];

        messageText = args.slice(3).join(' ');

    } else {

        target = args[0];

        dateStr = null;

        timeStr = args[1];

        messageText = args.slice(2).join(' ');

    }

    

    if (!target || !timeStr || !messageText) {

        await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `message [numéro/groupe] [heure] [message]` ou `message [numéro/groupe] [date] [heure] [message]`\n\nExemples :\n• `message +221705928204 20:15 Salut !`\n• `message +221705928204 23/03 20:15 Joyeux anniversaire !`" });

        return;

    }

    

    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

    if (!timeRegex.test(timeStr)) {

        await client.sendMessage(remoteJid, { text: "❌ *Format d'heure invalide*\n\nUtilise le format HH:MM (ex: 20:15)" });

        return;

    }

    

    let jidTarget;

    let targetDisplay;

    let isGroupLink = false;

    let groupInvite = null;

    

    if (target.includes('chat.whatsapp.com')) {

        groupInvite = extractGroupInvite(target);

        if (!groupInvite) {

            await client.sendMessage(remoteJid, { text: "❌ *Lien de groupe invalide*" });

            return;

        }

        isGroupLink = true;

        jidTarget = target;

        targetDisplay = "Groupe WhatsApp (lien d'invitation)";

    } else {

        let cleanNumber = target.replace(/[^0-9]/g, '');

        jidTarget = `${cleanNumber}@s.whatsapp.net`;

        targetDisplay = target;

    }

    

    const targetTime = calculateTargetDate(dateStr, timeStr);

    const messageId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 8);

    

    scheduledMessages.set(messageId, {

        target: jidTarget,

        originalTarget: targetDisplay,

        message: messageText,

        time: targetTime.getTime(),

        sent: false,

        created: Date.now(),

        creator: sender,

        isGroupLink: isGroupLink,

        groupInvite: groupInvite,

        groupName: isGroupLink ? "Groupe WhatsApp" : null

    });

    

    await saveScheduledMessages();

    

    const formattedDate = targetTime.toLocaleString('fr-FR');

    

    const confirmText = 

`✅ *MESSAGE PROGRAMMÉ !*

━━━━━━━━━━━━━━━━━━━━

📱 *Destinataire :* ${targetDisplay}

🕐 *Date :* ${formattedDate}

📝 *Message :* ${messageText}

🔢 *ID :* \`${messageId}\`

💡 *Pour annuler :* \`message cancel ${messageId}\`

📋 *Voir tous :* \`message list\`

ℹ️ *Le message sera automatiquement supprimé 24h après envoi*

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹

https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

> *DEV : 🍁AKANE KUROGAWA🌹*`;

    

    await client.sendMessage(remoteJid, { text: confirmText });

}

export default messageCommand;

export { startScheduler, checkScheduledMessages, loadScheduledMessages };