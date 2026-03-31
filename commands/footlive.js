// commands/footlive.js

// @cat: sport

// Version avec liens FlashScore

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// ==================== LIENS DES ÉQUIPES ====================

const teamUrls = {

    // Espagne

    "barcelona": "https://www.flashscore.fr/equipe/barcelone/9XB0VUje/resultats/",

    "real madrid": "https://www.flashscore.fr/equipe/real-madrid/IZWGWirU/resultats/",

    "atletico madrid": "https://www.flashscore.fr/equipe/atletico-madrid/7XjVbWc/resultats/",

    

    // Angleterre

    "liverpool": "https://www.flashscore.fr/equipe/liverpool/3Ji3LgWc/resultats/",

    "manchester city": "https://www.flashscore.fr/equipe/manchester-city/6k4rVbX8/resultats/",

    "arsenal": "https://www.flashscore.fr/equipe/arsenal/wmJeVbXa/resultats/",

    "chelsea": "https://www.flashscore.fr/equipe/chelsea/2kWjVbXq/resultats/",

    "manchester united": "https://www.flashscore.fr/equipe/manchester-united/4XjVbXr/resultats/",

    "tottenham": "https://www.flashscore.fr/equipe/tottenham/5XjWbXs/resultats/",

    

    // France

    "psg": "https://www.flashscore.fr/equipe/psg/FeLjQWaW/resultats/",

    "om": "https://www.flashscore.fr/equipe/marseille/3XjNWbZa/resultats/",

    "ol": "https://www.flashscore.fr/equipe/lyon/5XjOWbXb/resultats/",

    "monaco": "https://www.flashscore.fr/equipe/monaco/6XjPWbXc/resultats/",

    "lille": "https://www.flashscore.fr/equipe/lille/7XjQWbXd/resultats/",

    

    // Allemagne

    "bayern": "https://www.flashscore.fr/equipe/bayern-munich/2XjWlRbY/resultats/",

    "borussia dortmund": "https://www.flashscore.fr/equipe/borussia-dortmund/3XjXlRcZ/resultats/",

    

    // Italie

    "juventus": "https://www.flashscore.fr/equipe/juventus/9YbKVlXa/resultats/",

    "ac milan": "https://www.flashscore.fr/equipe/ac-milan/4XjKVbYa/resultats/",

    "inter milan": "https://www.flashscore.fr/equipe/inter/7XjMWbZc/resultats/",

    "napoli": "https://www.flashscore.fr/equipe/napoli/8XjNWbZd/resultats/",

    "roma": "https://www.flashscore.fr/equipe/roma/9XjOWbZe/resultats/"

};

// ==================== LIENS DES COMPÉTITIONS ====================

const leagueUrls = {

    "premier league": "https://www.flashscore.fr/football/angleterre/premier-league/",

    "laliga": "https://www.flashscore.fr/football/espagne/laliga/",

    "serie a": "https://www.flashscore.fr/football/italie/serie-a/",

    "bundesliga": "https://www.flashscore.fr/football/allemagne/bundesliga/",

    "ligue 1": "https://www.flashscore.fr/football/france/ligue-1/",

    "champions league": "https://www.flashscore.fr/football/europe/ligue-des-champions/",

    "europa league": "https://www.flashscore.fr/football/europe/europa-league/"

};

// ==================== COMMANDE PRINCIPALE ====================

async function footliveCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const subCommand = args[0]?.toLowerCase();

    const query = args.slice(1).join(' ');

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`⚽ *FOOT LIVE*

📝 *COMMANDES :*

• *footlive equipe [nom]* - Matchs d'une équipe

• *footlive ligue [nom]* - Résultats d'une ligue

• *footlive live* - Matchs en direct

• *footlive aujourdhui* - Matchs du jour

• *footlive teams* - Liste des équipes

• *footlive compet* - Liste des compétitions

💡 *EXEMPLES :*

• *footlive equipe barcelona*

• *footlive equipe psg*

• *footlive ligue premier league*

• *footlive live*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // ========== LISTE DES ÉQUIPES ==========

    if (subCommand === 'teams') {

        let teamsText = 

`⚽ *ÉQUIPES DISPONIBLES*

━━━━━━━━━━━━━━━━━━━━

*🇪🇸 ESPAGNE*

• barcelona, real madrid, atletico madrid

*🏴󠁧󠁢󠁥󠁮󠁧󠁿 ANGLETERRE*

• liverpool, manchester city, arsenal, chelsea, manchester united, tottenham

*🇫🇷 FRANCE*

• psg, om, ol, monaco, lille

*🇩🇪 ALLEMAGNE*

• bayern, borussia dortmund

*🇮🇹 ITALIE*

• juventus, ac milan, inter milan, napoli, roma

━━━━━━━━━━━━━━━━━━━━

💡 Utilise : *footlive equipe [nom]*`;

        

        await client.sendMessage(remoteJid, { text: teamsText });

        return;

    }

    

    // ========== LISTE DES COMPÉTITIONS ==========

    if (subCommand === 'compet') {

        let competText = 

`🏆 *COMPÉTITIONS*

━━━━━━━━━━━━━━━━━━━━

• Premier League (Angleterre)

• La Liga (Espagne)

• Serie A (Italie)

• Bundesliga (Allemagne)

• Ligue 1 (France)

• Champions League

• Europa League

━━━━━━━━━━━━━━━━━━━━

💡 Utilise : *footlive ligue [nom]*`;

        

        await client.sendMessage(remoteJid, { text: competText });

        return;

    }

    

    // ========== MATCHS D'UNE ÉQUIPE ==========

    if (subCommand === 'equipe' || subCommand === 'team') {

        if (!query) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `footlive equipe [nom]`\n\nExemple : `footlive equipe barcelona`\n\nVoir *footlive teams* pour la liste." });

            return;

        }

        

        const teamName = query.toLowerCase();

        let url = teamUrls[teamName];

        

        if (!url) {

            url = `https://www.flashscore.fr/recherche/?q=${encodeURIComponent(query)}`;

        }

        

        const resultText = 

`⚽ *${query.toUpperCase()}*

━━━━━━━━━━━━━━━━━━━━

🔗 *VOIR LES MATCHS :*

${url}

💡 Clique sur le lien pour voir les résultats

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: resultText });

        return;

    }

    

    // ========== MATCHS D'UNE LIGUE ==========

    if (subCommand === 'ligue' || subCommand === 'league') {

        if (!query) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `footlive ligue [nom]`\n\nExemple : `footlive ligue premier league`" });

            return;

        }

        

        const leagueName = query.toLowerCase();

        let url = leagueUrls[leagueName];

        

        if (!url) {

            url = `https://www.flashscore.fr/recherche/?q=${encodeURIComponent(query)}`;

        }

        

        const resultText = 

`🏆 *${query.toUpperCase()}*

━━━━━━━━━━━━━━━━━━━━

🔗 *VOIR LES RÉSULTATS :*

${url}

💡 Clique sur le lien pour voir les résultats

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: resultText });

        return;

    }

    

    // ========== MATCHS EN DIRECT ==========

    if (subCommand === 'live') {

        const resultText = 

`🔴 *MATCHS EN DIRECT*

━━━━━━━━━━━━━━━━━━━━

🔗 *VOIR LES MATCHS EN DIRECT :*

https://www.flashscore.fr

💡 Clique sur le lien pour voir les scores en temps réel

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: resultText });

        return;

    }

    

    // ========== MATCHS DU JOUR ==========

    if (subCommand === 'aujourdhui' || subCommand === 'today') {

        const resultText = 

`📅 *MATCHS DU JOUR*

━━━━━━━━━━━━━━━━━━━━

🔗 *VOIR LES MATCHS DU JOUR :*

https://www.flashscore.fr

💡 Clique sur le lien pour voir les matchs du jour

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: resultText });

        return;

    }

    

    // Commande invalide

    await client.sendMessage(remoteJid, { text: "❌ *Commande invalide !*\n\nUtilise *footlive help* pour voir les commandes." });

}

export default footliveCommand;