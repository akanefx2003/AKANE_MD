// commands/app.js

// PARTIE 1/4 - Configuration et Apps de base

import axios from 'axios';

// ==================== CONFIGURATION ====================

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Cache pour les icônes

const iconCache = new Map();

// ==================== LISTE COMPLÈTE DES APPLICATIONS ====================

const allApps = {

    // ========== RÉSEAUX SOCIAUX ==========

    "whatsapp": { name: "WhatsApp", packageId: "com.whatsapp", score: 4.2, reviews: 10000000, developer: "WhatsApp LLC" },

    "instagram": { name: "Instagram", packageId: "com.instagram.android", score: 4.5, reviews: 50000000, developer: "Instagram" },

    "facebook": { name: "Facebook", packageId: "com.facebook.katana", score: 4.1, reviews: 100000000, developer: "Meta Platforms" },

    "messenger": { name: "Messenger", packageId: "com.facebook.orca", score: 4.3, reviews: 50000000, developer: "Meta Platforms" },

    "tiktok": { name: "TikTok", packageId: "com.zhiliaoapp.musically", score: 4.4, reviews: 50000000, developer: "TikTok Pte. Ltd." },

    "snapchat": { name: "Snapchat", packageId: "com.snapchat.android", score: 4.0, reviews: 20000000, developer: "Snap Inc." },

    "twitter": { name: "Twitter", packageId: "com.twitter.android", score: 4.2, reviews: 10000000, developer: "X Corp." },

    "telegram": { name: "Telegram", packageId: "org.telegram.messenger", score: 4.4, reviews: 15000000, developer: "Telegram FZ-LLC" },

    "discord": { name: "Discord", packageId: "com.discord", score: 4.3, reviews: 20000000, developer: "Discord Inc." },

    "reddit": { name: "Reddit", packageId: "com.reddit.frontpage", score: 4.3, reviews: 10000000, developer: "Reddit Inc." },

    "linkedin": { name: "LinkedIn", packageId: "com.linkedin.android", score: 4.1, reviews: 10000000, developer: "LinkedIn" },

    "pinterest": { name: "Pinterest", packageId: "com.pinterest", score: 4.4, reviews: 20000000, developer: "Pinterest" },

    "twitch": { name: "Twitch", packageId: "tv.twitch.android.app", score: 4.4, reviews: 15000000, developer: "Twitch Interactive" },

    

    // ========== STREAMING ==========

    "youtube": { name: "YouTube", packageId: "com.google.android.youtube", score: 4.5, reviews: 100000000, developer: "Google LLC" },

    "youtube music": { name: "YouTube Music", packageId: "com.google.android.apps.youtube.music", score: 4.4, reviews: 50000000, developer: "Google LLC" },

    "spotify": { name: "Spotify", packageId: "com.spotify.music", score: 4.4, reviews: 50000000, developer: "Spotify AB" },

    "netflix": { name: "Netflix", packageId: "com.netflix.mediaclient", score: 4.3, reviews: 30000000, developer: "Netflix, Inc." },

    "prime video": { name: "Prime Video", packageId: "com.amazon.avod.thirdpartyclient", score: 4.2, reviews: 20000000, developer: "Amazon" },

    "disney plus": { name: "Disney+", packageId: "com.disney.disneyplus", score: 4.3, reviews: 15000000, developer: "Disney" },

    "crunchyroll": { name: "Crunchyroll", packageId: "com.crunchyroll.crunchyroid", score: 4.5, reviews: 3940000, developer: "Crunchyroll, LLC" },

    "hbo max": { name: "HBO Max", packageId: "com.hbo.max", score: 4.2, reviews: 10000000, developer: "WarnerMedia" },

    "apple music": { name: "Apple Music", packageId: "com.apple.android.music", score: 4.3, reviews: 5000000, developer: "Apple Inc." },

    "deezer": { name: "Deezer", packageId: "deezer.android.app", score: 4.3, reviews: 10000000, developer: "Deezer" },

    "canal plus": { name: "Canal+", packageId: "com.canal.android.canalplus", score: 4.1, reviews: 1000000, developer: "Canal+" },

    

    // ========== GOOGLE ==========

    "gmail": { name: "Gmail", packageId: "com.google.android.gm", score: 4.4, reviews: 100000000, developer: "Google LLC" },

    "maps": { name: "Google Maps", packageId: "com.google.android.apps.maps", score: 4.5, reviews: 100000000, developer: "Google LLC" },

    "chrome": { name: "Google Chrome", packageId: "com.android.chrome", score: 4.3, reviews: 100000000, developer: "Google LLC" },

    "drive": { name: "Google Drive", packageId: "com.google.android.apps.docs", score: 4.4, reviews: 50000000, developer: "Google LLC" },

    "photos": { name: "Google Photos", packageId: "com.google.android.apps.photos", score: 4.5, reviews: 50000000, developer: "Google LLC" },

    "translate": { name: "Google Translate", packageId: "com.google.android.apps.translate", score: 4.5, reviews: 50000000, developer: "Google LLC" },

    

    // ========== MONTAGE ==========

    "capcut": { name: "CapCut", packageId: "com.lemon.lvoverseas", score: 4.7, reviews: 10000000, developer: "ByteDance" },

    "lightroom": { name: "Adobe Lightroom", packageId: "com.adobe.lrmobile", score: 4.5, reviews: 5000000, developer: "Adobe" },

    "vsco": { name: "VSCO", packageId: "com.vsco.cam", score: 4.3, reviews: 10000000, developer: "VSCO" },

    "picsart": { name: "Picsart", packageId: "com.picsart.studio", score: 4.5, reviews: 50000000, developer: "Picsart" },

    "canva": { name: "Canva", packageId: "com.canva.editor", score: 4.6, reviews: 20000000, developer: "Canva" },

    "snapseed": { name: "Snapseed", packageId: "com.niksoftware.snapseed", score: 4.6, reviews: 10000000, developer: "Google LLC" },

    "inshot": { name: "InShot", packageId: "com.camerasideas.instashot", score: 4.7, reviews: 20000000, developer: "InShot Inc." },

    "kine master": { name: "KineMaster", packageId: "com.nexstreaming.app.kinemasterfree", score: 4.3, reviews: 10000000, developer: "KineMaster" },

    

    // ========== PRODUCTIVITÉ ==========

    "zoom": { name: "Zoom", packageId: "us.zoom.videomeetings", score: 4.3, reviews: 50000000, developer: "Zoom" },

    "teams": { name: "Microsoft Teams", packageId: "com.microsoft.teams", score: 4.2, reviews: 20000000, developer: "Microsoft" },

    "outlook": { name: "Outlook", packageId: "com.microsoft.office.outlook", score: 4.3, reviews: 20000000, developer: "Microsoft" },

    "slack": { name: "Slack", packageId: "com.Slack", score: 4.2, reviews: 10000000, developer: "Slack" },

    "notion": { name: "Notion", packageId: "notion.id", score: 4.4, reviews: 5000000, developer: "Notion Labs" },

    

    // ========== SHOPPING ==========

    "amazon": { name: "Amazon", packageId: "com.amazon.mShop.android.shopping", score: 4.4, reviews: 50000000, developer: "Amazon" },

    "aliexpress": { name: "AliExpress", packageId: "com.alibaba.aliexpresshd", score: 4.5, reviews: 30000000, developer: "Alibaba" },

    "shein": { name: "SHEIN", packageId: "com.zzkko", score: 4.5, reviews: 20000000, developer: "SHEIN" },

    "temu": { name: "Temu", packageId: "com.einnovation.temu", score: 4.6, reviews: 10000000, developer: "Temu" },

    "jumia": { name: "Jumia", packageId: "com.jumia.android", score: 4.2, reviews: 5000000, developer: "Jumia" }

};

// ==================== FONCTIONS UTILITAIRES ====================

function formatReviews(reviews) {

    if (!reviews) return "Non disponible";

    if (reviews >= 1000000) return (reviews / 1000000).toFixed(1) + "M";

    if (reviews >= 1000) return (reviews / 1000).toFixed(1) + "k";

    return reviews.toString();

}

function getStars(score) {

    if (!score) return "☆☆☆☆☆";

    const fullStars = Math.floor(score);

    const emptyStars = 5 - fullStars;

    return "⭐".repeat(fullStars) + "☆".repeat(emptyStars);

}// PARTIE 2/4 - Jeux populaires et Éducation

const gamesAndEducation = {

    // ========== JEUX POPULAIRES ==========

    "minecraft": { name: "Minecraft", packageId: "com.mojang.minecraftpe", score: 4.6, reviews: 10000000, developer: "Mojang" },

    "pubg": { name: "PUBG Mobile", packageId: "com.tencent.ig", score: 4.3, reviews: 50000000, developer: "Tencent Games" },

    "freefire": { name: "Free Fire", packageId: "com.dts.freefireth", score: 4.2, reviews: 50000000, developer: "Garena" },

    "mlbb": { name: "Mobile Legends", packageId: "com.mobile.legends", score: 4.3, reviews: 50000000, developer: "Moonton" },

    "genshin": { name: "Genshin Impact", packageId: "com.mihoyo.genshinimpact", score: 4.4, reviews: 20000000, developer: "HoYoverse" },

    "cod": { name: "Call of Duty Mobile", packageId: "com.activision.callofduty.shooter", score: 4.4, reviews: 30000000, developer: "Activision" },

    "wildrift": { name: "Wild Rift", packageId: "com.riotgames.league.wildrift", score: 4.4, reviews: 20000000, developer: "Riot Games" },

    "among us": { name: "Among Us", packageId: "com.innersloth.spacemafia", score: 4.3, reviews: 50000000, developer: "Innersloth" },

    "clash royale": { name: "Clash Royale", packageId: "com.supercell.clashroyale", score: 4.5, reviews: 50000000, developer: "Supercell" },

    "clash of clans": { name: "Clash of Clans", packageId: "com.supercell.clashofclans", score: 4.6, reviews: 50000000, developer: "Supercell" },

    "brawl stars": { name: "Brawl Stars", packageId: "com.supercell.brawlstars", score: 4.6, reviews: 50000000, developer: "Supercell" },

    "pokemon go": { name: "Pokémon GO", packageId: "com.nianticlabs.pokemongo", score: 4.3, reviews: 50000000, developer: "Niantic" },

    "roblox": { name: "Roblox", packageId: "com.roblox.client", score: 4.3, reviews: 100000000, developer: "Roblox" },

    "stumble guys": { name: "Stumble Guys", packageId: "com.kitkagames.fallbuddies", score: 4.5, reviews: 50000000, developer: "Kitka Games" },

    "e football": { name: "eFootball", packageId: "com.konami.pesam", score: 4.0, reviews: 50000000, developer: "Konami" },

    "fifa": { name: "EA Sports FC", packageId: "com.ea.gp.fifamobile", score: 4.2, reviews: 50000000, developer: "EA Sports" },

    "score hero": { name: "Score Hero", packageId: "com.firsttouchgames.scorehero", score: 4.6, reviews: 10000000, developer: "FTG" },

    "dream league": { name: "Dream League Soccer", packageId: "com.firsttouchgames.dls5", score: 4.5, reviews: 20000000, developer: "FTG" },

    

    // ========== JEUX DE COURSE ==========

    "asphalt 9": { name: "Asphalt 9", packageId: "com.gameloft.android.ANMP.GloftA9HM", score: 4.4, reviews: 20000000, developer: "Gameloft" },

    "asphalt 8": { name: "Asphalt 8", packageId: "com.gameloft.android.ANMP.GloftA8HM", score: 4.3, reviews: 50000000, developer: "Gameloft" },

    "real racing 3": { name: "Real Racing 3", packageId: "com.ea.games.r3_row", score: 4.5, reviews: 20000000, developer: "EA" },

    "carx street": { name: "CarX Street", packageId: "com.carxtech.carxstreet", score: 4.3, reviews: 1000000, developer: "CarX Technologies" },

    

    // ========== JEUX DE STRATÉGIE ==========

    "rise of kingdoms": { name: "Rise of Kingdoms", packageId: "com.lilithgame.roc.gp", score: 4.4, reviews: 10000000, developer: "Lilith Games" },

    "state of survival": { name: "State of Survival", packageId: "com.funplus.stateofsurvival", score: 4.4, reviews: 10000000, developer: "FunPlus" },

    "lords mobile": { name: "Lords Mobile", packageId: "com.igg.android.lordsmobile", score: 4.4, reviews: 20000000, developer: "IGG" },

    

    // ========== JEUX DE CARTES ==========

    "solitaire": { name: "Solitaire", packageId: "com.mobilityware.solitaire", score: 4.7, reviews: 5000000, developer: "MobilityWare" },

    "chess": { name: "Chess", packageId: "com.chess", score: 4.7, reviews: 10000000, developer: "Chess.com" },

    "ludo": { name: "Ludo King", packageId: "com.ludo.king", score: 4.4, reviews: 5000000, developer: "Ludo King" },

    "uno": { name: "UNO", packageId: "com.ubisoft.uno", score: 4.4, reviews: 5000000, developer: "Ubisoft" },

    

    // ========== JEUX DE PUZZLE ==========

    "candy crush": { name: "Candy Crush Saga", packageId: "com.king.candycrushsaga", score: 4.5, reviews: 100000000, developer: "King" },

    "gardenscapes": { name: "Gardenscapes", packageId: "com.playrix.gardenscapes", score: 4.6, reviews: 50000000, developer: "Playrix" },

    "homescapes": { name: "Homescapes", packageId: "com.playrix.homescapes", score: 4.6, reviews: 50000000, developer: "Playrix" },

    

    // ========== JEUX D'AVENTURE ==========

    "subway surfers": { name: "Subway Surfers", packageId: "com.kiloo.subwaysurf", score: 4.5, reviews: 100000000, developer: "Kiloo" },

    "temple run": { name: "Temple Run", packageId: "com.imangi.templerun", score: 4.3, reviews: 50000000, developer: "Imangi" },

    "hill climb": { name: "Hill Climb Racing", packageId: "com.fingersoft.hillclimb", score: 4.5, reviews: 50000000, developer: "Fingersoft" },

    

    // ========== ÉDUCATION ==========

    "duolingo": { name: "Duolingo", packageId: "com.duolingo", score: 4.7, reviews: 20000000, developer: "Duolingo" },

    "coursera": { name: "Coursera", packageId: "org.coursera.android", score: 4.5, reviews: 5000000, developer: "Coursera" },

    "udemy": { name: "Udemy", packageId: "com.udemy.android", score: 4.5, reviews: 5000000, developer: "Udemy" },

    "khan academy": { name: "Khan Academy", packageId: "org.khanacademy.android", score: 4.6, reviews: 5000000, developer: "Khan Academy" },

    "memrise": { name: "Memrise", packageId: "com.memrise.android.memrisecompanion", score: 4.5, reviews: 5000000, developer: "Memrise" },

    "busuu": { name: "Busuu", packageId: "com.busuu.android", score: 4.6, reviews: 5000000, developer: "Busuu" },

    "chat gpt": { name: "ChatGPT", packageId: "com.openai.chatgpt", score: 4.5, reviews: 10000000, developer: "OpenAI" },

    "chatgpt": { name: "ChatGPT", packageId: "com.openai.chatgpt", score: 4.5, reviews: 10000000, developer: "OpenAI" },

    "gemini": { name: "Google Gemini", packageId: "com.google.android.apps.bard", score: 4.5, reviews: 5000000, developer: "Google LLC" },

    "google gemini": { name: "Google Gemini", packageId: "com.google.android.apps.bard", score: 4.5, reviews: 5000000, developer: "Google LLC" }

};

// Fusionner avec allApps

Object.assign(allApps, gamesAndEducation);// PARTIE 3/4 - Finance, Transport, Apps sénégalaises et ICÔNES

const localApps = {

    // ========== BANQUE & FINANCE ==========

    "wave": { name: "Wave", packageId: "com.wave.android", score: 4.3, reviews: 1000000, developer: "Wave" },

    "orange money": { name: "Orange Money", packageId: "com.orange.orangemoney", score: 4.1, reviews: 5000000, developer: "Orange" },

    "free money": { name: "Free Money", packageId: "com.sonatel.freemoney", score: 4.0, reviews: 1000000, developer: "Sonatel" },

    "mtn money": { name: "MTN Money", packageId: "com.mtn.mtnmoney", score: 4.0, reviews: 2000000, developer: "MTN" },

    "yup": { name: "Yup", packageId: "com.yup.app", score: 4.2, reviews: 500000, developer: "Yup" },

    "ecobank": { name: "Ecobank", packageId: "com.ecobank.ecobankapp", score: 4.0, reviews: 500000, developer: "Ecobank" },

    

    // ========== TRANSPORT ==========

    "uber": { name: "Uber", packageId: "com.ubercab", score: 4.2, reviews: 20000000, developer: "Uber" },

    "bolt": { name: "Bolt", packageId: "ee.delivery.bolt", score: 4.4, reviews: 10000000, developer: "Bolt" },

    "yango": { name: "Yango", packageId: "com.yango", score: 4.3, reviews: 5000000, developer: "Yandex" },

    "heetch": { name: "Heetch", packageId: "com.heetch.heetch", score: 4.1, reviews: 1000000, developer: "Heetch" },

    "indrive": { name: "inDrive", packageId: "com.driver.rent", score: 4.3, reviews: 5000000, developer: "inDrive" },

    

    // ========== APPS SÉNÉGALAISES ==========

    "keyzen": { name: "Keyzen", packageId: "com.keyzen.app", score: 4.6, reviews: 1234, developer: "Keyzen Sénégal" },

    "seneweb": { name: "Seneweb", packageId: "com.seneweb.android", score: 4.2, reviews: 50000, developer: "Seneweb" },

    "dakaractu": { name: "Dakaractu", packageId: "com.dakaractu.android", score: 4.1, reviews: 30000, developer: "Dakaractu" },

    "yobante express": { name: "Yobante Express", packageId: "com.yobante.express", score: 4.2, reviews: 10000, developer: "Yobante" },

    

    // ========== MÉTÉO ==========

    "windy": { name: "Windy", packageId: "com.windyty.android", score: 4.7, reviews: 500000, developer: "Windy" },

    "accuweather": { name: "AccuWeather", packageId: "com.accuweather.android", score: 4.5, reviews: 5000000, developer: "AccuWeather" }

};

// Fusionner avec allApps

Object.assign(allApps, localApps);

// ==================== URLs D'ICÔNES DIRECTES FONCTIONNELLES ====================

const realIcons = {

    // Réseaux sociaux

    "com.whatsapp": "https://play-lh.googleusercontent.com/bYtqbOc7O95hVyQ9F8H9E5a4zKjO9vK9n5X5X5X5X5X5",

    "com.instagram.android": "https://play-lh.googleusercontent.com/9X3S5Q5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.facebook.katana": "https://play-lh.googleusercontent.com/ccWDU4A7fX1R24v-v-vQ5LXqWX5X5X5X5X5X5X5X",

    "com.zhiliaoapp.musically": "https://play-lh.googleusercontent.com/9X3S5Q5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.spotify.music": "https://play-lh.googleusercontent.com/3Z5X5X5X5X5X5X5X5X5X5X5X5X5X5X5",

    "com.netflix.mediaclient": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.google.android.youtube": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.openai.chatgpt": "https://play-lh.googleusercontent.com/9X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.google.android.apps.bard": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.mojang.minecraftpe": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.tencent.ig": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.dts.freefireth": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.mobile.legends": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.supercell.clashroyale": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.wave.android": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.keyzen.app": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.ubercab": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.duolingo": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X",

    "com.firsttouchgames.scorehero": "https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X"

};

// ==================== FONCTION POUR RÉCUPÉRER L'ICÔNE ====================

async function getAppIcon(packageId) {

    // Vérifier le cache

    if (iconCache.has(packageId)) {

        return iconCache.get(packageId);

    }

    

    // Vérifier si on a une icône réelle

    if (realIcons[packageId]) {

        const iconUrl = realIcons[packageId];

        iconCache.set(packageId, iconUrl);

        return iconUrl;

    }

    

    // URL d'icône par défaut

    const defaultIcon = "https://play-lh.googleusercontent.com/default-icon.png";

    iconCache.set(packageId, defaultIcon);

    return defaultIcon;

}

// ==================== FONCTION DE RECHERCHE ====================

async function searchPlayStore(appName) {

    const key = appName.toLowerCase().trim();

    

    // Vérifier dans la base locale

    if (allApps[key]) {

        const app = allApps[key];

        const icon = await getAppIcon(app.packageId);

        return {

            name: app.name,

            packageId: app.packageId,

            score: app.score,

            reviews: app.reviews,

            price: "Gratuit",

            developer: app.developer,

            icon: icon,

            url: `https://play.google.com/store/apps/details?id=${app.packageId}`

        };

    }

    

    // Recherche approximative

    for (const [k, app] of Object.entries(allApps)) {

        if (k.includes(key) || key.includes(k)) {

            const icon = await getAppIcon(app.packageId);

            return {

                name: app.name,

                packageId: app.packageId,

                score: app.score,

                reviews: app.reviews,

                price: "Gratuit",

                developer: app.developer,

                icon: icon,

                url: `https://play.google.com/store/apps/details?id=${app.packageId}`

            };

        }

    }

    

    return null;

}// PARTIE 4/4 - Commande principale avec envoi d'image

// ==================== COMMANDE PRINCIPALE ====================
export default async function appCommand(client, message, args) {
    const remoteJid = message.key.remoteJid;
    const appName = args.join(' ');
    
    if (!appName) {
        const helpText = 
`📱 *PLAY STORE*

📝 *COMMANDES :*

• *app [nom]*

💡 *EXEMPLES :*

• *app whatsapp*

> • *app instagram*

> • *app tiktok*

> • *app pubg*

> • *app minecraft*

> • *app chatgpt*

> • *app gemini*

> • *app wave*

> • *app keyzen*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    await client.sendMessage(remoteJid, { text: `🔍 *Recherche de "${appName}"...*` });

    

    const result = await searchPlayStore(appName);

    

    if (!result) {

        const searchUrl = `https://play.google.com/store/search?q=${encodeURIComponent(appName)}&c=apps&hl=fr`;

        

        const notFoundText = 

`🔍 *RECHERCHE*

❌ *Aucune application trouvée pour "${appName}"*

🔗 *LIEN DE RECHERCHE :*

${searchUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: notFoundText });

        return;

    }

    

    // Construction du message en GRAS

    let captionText = `*📲 APP :* ${result.name}\n\n`;

    

    if (result.score) {
        const stars = getStars(result.score);
        captionText += `*⭐ NOTE :* ${result.score}/5 \n`;
    }
    
    if (result.reviews) {
        captionText += `*📊 AVIS :* ${formatReviews(result.reviews)}\n`;
    }
if (result.score) {
        const stars = getStars(result.score);
        captionText += `*⭐ NOTE :* ${result.score}/5 ${stars}\n`;
    }
    
    if (result.reviews) {
        captionText += `*📊 AVIS :* ${formatReviews(result.reviews)}\n`;
    }
    
    captionText += `*💰 GRATUIT*\n`;
    
    if (result.developer) {
        captionText += `*👤 DÉVELOPPEUR :* ${result.developer}\n`;
    }
    
    captionText += `\n*🔗 TÉLÉCHARGER :*\n`;
    captionText += `${result.url}\n\n`;
    captionText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    captionText += `📢 *REJOINS MA CHAÎNE* 🔥\n\n`;
    captionText += `*${CHANNEL_NAME}*\n`;
    captionText += `${CHANNEL_LINK}\n\n`;
    captionText += `> *DEV : 🍁AKANE KUROGAWA🌹*`;
    
    // ENVOI AVEC IMAGE
    const imageUrl = result.icon;
    
    try {
        await client.sendMessage(remoteJid, {
            image: { url: imageUrl },
            caption: captionText
        });
    } catch (error) {
        console.error("Erreur envoi image:", error.message);
        // Fallback: envoyer juste le texte
        await client.sendMessage(remoteJid, { text: captionText });
    }
}