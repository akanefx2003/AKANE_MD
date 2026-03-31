import axios from 'axios';

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

import stylizedChar from '../utils/fancy.js';

// 🔗 LIEN DE TA CHAÎNE WHATSAPP

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

const PRAYER_FILE = path.join(DATA_DIR, 'prayer_tracker.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(PRAYER_FILE)) {

    fs.writeFileSync(PRAYER_FILE, JSON.stringify({ users: {} }, null, 2));

}

const bibleVerses = [

    { verse: "Jean 3:16", text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle." },

    { verse: "Psaume 23:1", text: "L'Éternel est mon berger: je ne manquerai de rien." },

    { verse: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },

    { verse: "Jérémie 29:11", text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance." },

    { verse: "Romains 8:28", text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein." },

    { verse: "Proverbes 3:5-6", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers." },

    { verse: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu; je te fortifie, je viens à ton secours, je te soutiens de ma droite triomphante." },

    { verse: "Matthieu 11:28", text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos." },

    { verse: "Psaume 46:2", text: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse." },

    { verse: "1 Corinthiens 16:14", text: "Que tout ce que vous faites se fasse avec charité." },

    { verse: "Galates 5:22-23", text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance." },

    { verse: "Éphésiens 4:32", text: "Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonné en Christ." },

    { verse: "Josué 1:9", text: "Ne t'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." },

    { verse: "Psaume 34:18", text: "L'Éternel est près de ceux qui ont le cœur brisé, et il sauve ceux qui ont l'esprit dans l'abattement." },

    { verse: "Romains 12:12", text: "Réjouissez-vous en espérance. Soyez patients dans l'affliction. Persévérez dans la prière." },

    { verse: "Matthieu 5:4", text: "Heureux les affligés, car ils seront consolés!" },

    { verse: "Psaume 27:1", text: "L'Éternel est ma lumière et mon salut: De qui aurais-je crainte? L'Éternel est le soutien de ma vie: De qui aurais-je peur?" },

    { verse: "1 Pierre 5:7", text: "Et déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous." },

    { verse: "Psaume 37:4", text: "Fais de l'Éternel tes délices, et il te donnera ce que ton cœur désire." },

    { verse: "2 Corinthiens 5:7", text: "Car nous marchons par la foi et non par la vue." }

];

function loadTracker() {

    try {

        const data = fs.readFileSync(PRAYER_FILE, 'utf8');

        return JSON.parse(data);

    } catch (error) {

        return { users: {} };

    }

}

function saveTracker(data) {

    fs.writeFileSync(PRAYER_FILE, JSON.stringify(data, null, 2));

}

function getVerseOfTheDay() {

    const today = new Date();

    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    const verseIndex = dayOfYear % bibleVerses.length;

    return bibleVerses[verseIndex];

}

function formatDate(date) {

    const d = new Date(date);

    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

}

function getMonthName(monthIndex) {

    const months = [

        "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",

        "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"

    ];

    return months[monthIndex];

}

function getDayName(dayIndex) {

    const days = [

        "DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"

    ];

    return days[dayIndex];

}

// 📅 CALENDRIER EN LISTE VERTICALE

function createCalendar(userData) {

    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthName = getMonthName(currentMonth);

    

    let calendar = `*${monthName} ${currentYear}*\n`;

    calendar += `──────────────\n\n`;

    

    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(currentYear, currentMonth, day);

        const dayOfWeek = date.getDay();

        const dayName = getDayName(dayOfWeek);

        

        const dateStr = `${day.toString().padStart(2, '0')}/${(currentMonth + 1).toString().padStart(2, '0')}/${currentYear}`;

        const isRead = userData.history.some(h => h.date === dateStr);

        

        if (isRead) {

            calendar += `*${day.toString().padStart(2, '0')} 🟢 ${dayName}*\n`;

        } else {

            calendar += `*${day.toString().padStart(2, '0')} 🔴 ${dayName}*\n`;

        }

    }

    

    calendar += `\n🟢 = Lu  |  🔴 = Non lu`;

    

    return calendar;

}

async function prayCommand(sock, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const sender = message.key?.participant || remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(6).trim();

        const tracker = loadTracker();

        const userId = sender.split('@')[0];

        if (!tracker.users[userId]) {

            tracker.users[userId] = {

                lastRead: null,

                history: [],

                streak: 0

            };

        }

        const userData = tracker.users[userId];

        if (!args) {

            const verseOfDay = getVerseOfTheDay();

            const today = formatDate(new Date());

            const lastRead = userData.lastRead ? formatDate(userData.lastRead) : 'Jamais';

            const helpMessage = 

                "╔══════════════════╗\n" +

                "       *PRAY*       \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "📖 *Verset du jour:*\n\n" +

                `*${verseOfDay.verse}*\n` +

                `"${verseOfDay.text}"\n\n` +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                `📅 *Dernière lecture:* ${lastRead}\n` +

                `🔥 *Série actuelle:* ${userData.streak} jours\n\n` +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "📝 *Commandes:*\n" +

                "`.pray read`    - Marquer comme lu\n" +

                "`.pray status`  - Voir calendrier\n" +

                "`.pray history` - Historique\n\n" +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +

                "> *_© AKANE-MD 🌹_*";

            return await sock.sendMessage(remoteJid, { text: helpMessage });

        }

        if (args === 'read') {

            const today = new Date();

            const todayStr = formatDate(today);

            const lastRead = userData.lastRead ? new Date(userData.lastRead) : null;

            

            if (lastRead && formatDate(lastRead) === todayStr) {

                return await sock.sendMessage(remoteJid, { 

                    text: "🙏 *Tu as déjà lu le verset aujourd'hui !*\nReviens demain !" 

                });

            }

            const yesterday = new Date(today);

            yesterday.setDate(yesterday.getDate() - 1);

            

            if (lastRead && formatDate(lastRead) === formatDate(yesterday)) {

                userData.streak++;

            } else {

                userData.streak = 1;

            }

            userData.history.push({

                date: todayStr,

                verse: getVerseOfTheDay().verse

            });

            if (userData.history.length > 90) {

                userData.history = userData.history.slice(-90);

            }

            userData.lastRead = today;

            saveTracker(tracker);

            const readMessage = 

                "╔══════════════════╗\n" +

                "     *LECTURE*      \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "✅ *Verset marqué comme lu !*\n\n" +

                `🔥 *Série actuelle:* ${userData.streak} jours\n\n` +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +

                "> *_© AKANE-MD 🌹_*";

            return await sock.sendMessage(remoteJid, { text: readMessage });

        }

        if (args === 'status') {

            const missedDays = [];

            const today = new Date();

            

            if (userData.history.length > 0) {

                const lastDate = new Date(userData.lastRead);

                const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

                

                if (daysDiff > 1) {

                    for (let i = 1; i < daysDiff; i++) {

                        const missedDate = new Date(lastDate);

                        missedDate.setDate(missedDate.getDate() + i);

                        missedDays.push(formatDate(missedDate));

                    }

                }

            }

            const calendar = createCalendar(userData);

            const statusMessage = 

                "╔══════════════════╗\n" +

                "      *STATUS*      \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "📊 *Statistiques:*\n\n" +

                `📖 *Total lectures:* ${userData.history.length}\n` +

                `🔥 *Série actuelle:* ${userData.streak} jours\n\n` +

                calendar + '\n\n' +

                (missedDays.length > 0 ? `⚠️ *Jours manqués:* ${missedDays.length}\n` : '') +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +

                "> *_© AKANE-MD 🌹_*";

            return await sock.sendMessage(remoteJid, { text: statusMessage });

        }

        if (args === 'history') {

            const historyList = userData.history.slice(-15).reverse().map((h, index) => 

                `${index + 1}. 📅 ${h.date} - ${h.verse}`

            ).join('\n');

            const historyMessage = 

                "╔══════════════════╗\n" +

                "     *HISTORIQUE*   \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                (historyList || "📭 *Aucune lecture enregistrée*") + "\n\n" +

                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +

                "> *_© AKANE-MD 🌹_*";

            return await sock.sendMessage(remoteJid, { text: historyMessage });

        }

    } catch (error) {

        console.error('Erreur prayCommand:', error);

        

        const remoteJid = message.key?.remoteJid;

        

        const errorMessage = 

            "╔══════════════════╗\n" +

            "      *ERREUR*       \n" +

            "╚══════════════════╝\n\n" +

            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

            "❌ *Erreur lors de l'exécution*\n\n" +

            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +

            "> *_© AKANE-MD 🌹_*";

        await sock.sendMessage(remoteJid, { text: errorMessage });

    }

}

export default prayCommand;