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

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ==================== BANQUES DE NOMS ALÉATOIRES ====================

const nomsHommes = [

    "Lucas", "Thomas", "Martin", "Nicolas", "Pierre", "Jean", "Michel", "Philippe", "Alain", "Daniel",

    "Mathieu", "David", "Julien", "Kevin", "Anthony", "François", "Antoine", "Alexandre", "Sébastien",

    "Christophe", "Vincent", "Laurent", "Stéphane", "Jérôme", "Guillaume", "Olivier", "Maxime", "Quentin",

    "Romain", "Florian", "Cédric", "Renaud", "Arnaud", "Gilles", "Thierry", "Pascal", "Fabrice", "Didier",

    "Yannick", "Hervé", "Patrice", "Bruno", "Marc", "Eric", "Frédéric", "Gérard", "Jacques", "Claude",

    "Kenji", "Takashi", "Hiroshi", "Yuki", "Haruki", "Ren", "Satoshi", "Makoto", "Takeshi", "Daisuke",

    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",

    "Mohammed", "Ali", "Hassan", "Omar", "Ibrahim", "Ahmed", "Youssef", "Karim", "Rachid", "Said"

];

const nomsFemmes = [

    "Marie", "Julie", "Sophie", "Isabelle", "Catherine", "Nathalie", "Sylvie", "Anne", "Valérie",

    "Sandrine", "Christelle", "Aurélie", "Émilie", "Caroline", "Claire", "Stéphanie", "Céline", "Virginie",

    "Laurence", "Patricia", "Brigitte", "Françoise", "Monique", "Christiane", "Michèle", "Danielle",

    "Yuki", "Sakura", "Aiko", "Yui", "Miku", "Hana", "Rin", "Mio", "Asuka", "Rei", "Akari", "Hikari",

    "Emma", "Camille", "Léa", "Manon", "Chloé", "Sarah", "Laura", "Lucie", "Pauline", "Mathilde",

    "Fatima", "Amina", "Khadija", "Mariam", "Zahra", "Leila", "Nadia", "Samira", "Souad", "Nawal"

];

const nomsFamille = [

    "Dupont", "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy",

    "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent",

    "Fournier", "Morel", "Girard", "Andre", "Lefevre", "Mercier", "Dupuis", "Lambert", "Bonnet", "Francois",

    "Martinez", "Fernandez", "Lopez", "Sanchez", "Perez", "Gonzalez", "Rodriguez", "Gomez", "Diaz", "Ruiz",

    "Suzuki", "Tanaka", "Takahashi", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida",

    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",

    "Alami", "Bennis", "Fassi", "El Amrani", "Benali", "Idrissi", "Ouazzani", "Berrada", "Chaoui", "Rahmani"

];

const prenomsMixte = [

    "Claude", "Dominique", "Camille", "Maxime", "Alex", "Charlie", "Sacha", "Andrea", "Noa", "Lou",

    "Kim", "Sam", "Jessy", "Stevie", "Casey", "Riley", "Avery", "Jordan", "Taylor", "Morgan"

];

const lieux = [

    "Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse", "Nice", "Nantes", "Strasbourg", "Lille", "Rennes",

    "Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Saitama",

    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",

    "Dallas", "San Jose", "Londres", "Manchester", "Liverpool", "Birmingham", "Glasgow", "Edimbourg",

    "Casablanca", "Rabat", "Fès", "Marrakech", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan"

];

const professions = [

    "boulanger", "professeur", "médecin", "architecte", "journaliste", "avocat", "ingénieur", "artiste",

    "musicien", "écrivain", "photographe", "cuisinier", "plombier", "électricien", "menuisier", "infirmier",

    "vétérinaire", "pharmacien", "dentiste", "comptable", "designer", "développeur", "commerçant", "pompier",

    "policier", "militaire", "agriculteur", "pêcheur", "guide touristique", "traducteur", "bibliothécaire"

];

const animaux = [

    "un chat", "un chien", "un perroquet", "un hamster", "un lapin", "une tortue", "un poisson rouge",

    "un furet", "un cochon d'Inde", "une souris", "un rat", "un serpent", "un lézard", "un gecko",

    "un chinchilla", "un hérisson", "une poule", "un canard", "une chèvre", "un mouton"

];

const objetsMagiques = [

    "une amulette ancienne", "un grimoire mystérieux", "une baguette de sorcier", "une pierre précieuse",

    "un miroir enchanté", "une clé dorée", "un anneau magique", "une épée légendaire", "un bouclier sacré",

    "une potion mystérieuse", "un cristal lumineux", "une horloge magique", "un livre de sorts", "une carte au trésor"

];

// ==================== FONCTIONS POUR NOMS ALÉATOIRES ====================

function getRandomInt(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

function getRandomPrenomHomme() {

    return nomsHommes[Math.floor(Math.random() * nomsHommes.length)];

}

function getRandomPrenomFemme() {

    return nomsFemmes[Math.floor(Math.random() * nomsFemmes.length)];

}

function getRandomPrenom() {

    return Math.random() > 0.5 ? getRandomPrenomHomme() : getRandomPrenomFemme();

}

function getRandomNomFamille() {

    return nomsFamille[Math.floor(Math.random() * nomsFamille.length)];

}

function getRandomNomComplet() {

    const prenom = getRandomPrenom();

    const nom = getRandomNomFamille();

    return { prenom, nom, complet: `${prenom} ${nom}` };

}

function getRandomCouple() {

    return {

        homme: getRandomPrenomHomme(),

        femme: getRandomPrenomFemme(),

        nom: getRandomNomFamille()

    };

}

function getRandomLieu() {

    return lieux[Math.floor(Math.random() * lieux.length)];

}

function getRandomProfession() {

    return professions[Math.floor(Math.random() * professions.length)];

}

function getRandomAnimal() {

    return animaux[Math.floor(Math.random() * animaux.length)];

}

function getRandomObjetMagique() {

    return objetsMagiques[Math.floor(Math.random() * objetsMagiques.length)];

}

// ==================== STRUCTURES D'HISTOIRES AVEC TROUS ====================

const structuresAmour = [

    {

        intro: (p) => `Dans la charmante ville de ${p.lieu1}, vivait une jeune ${p.profession1} nommée ${p.femme}. Sa vie était paisible, rythmée par les saisons et les sourires des passants. Elle ne savait pas que ce jour d'automne allait changer sa vie à jamais.`,

        milieu: (p) => `C'est alors qu'il apparut. ${p.homme}, un ${p.profession2} au regard doux, venait d'emménager dans le quartier. Leurs regards se croisèrent devant la petite ${p.lieu2}, et le temps sembla suspendre son vol.`,

        developpement: (p) => `Les semaines passèrent. Ils se retrouvaient chaque jour au même endroit, échangeant des sourires timides, des mots hésitants. ${p.femme} découvrit que ${p.homme} partageait sa passion pour ${p.passion}, et cette complicité naissante les rapprocha.`,

        climax: (p) => `Mais le destin allait les séparer. ${p.homme} reçut une offre de travail à ${p.lieu3}, à des milliers de kilomètres. La veille de son départ, sous une pluie battante, il lui avoua ses sentiments.`,

        fin: (p) => `Deux ans plus tard, alors qu'elle avait repris sa vie, il revint. Il s'agenouilla devant elle, une rose à la main, et lui demanda de l'épouser. Aujourd'hui, ils vivent à ${p.lieu1} avec leurs deux enfants, et chaque soir, ils se racontent comment leur amour a survécu à la distance.`

    },

    {

        intro: (p) => `Au cœur du quartier animé de ${p.lieu1}, ${p.homme} tenait une petite librairie poussiéreuse. Il aimait l'odeur des vieux papiers et le silence des après-midi. Jusqu'au jour où ${p.femme} poussa la porte.`,

        milieu: (p) => `Elle cherchait un livre rare, introuvable ailleurs. Il le chercha avec elle, et leurs recherches les menèrent dans les recoins les plus secrets de la boutique. Leurs mains se touchèrent en attrapant le même volume.`,

        developpement: (p) => `Elle revint le lendemain, puis le surlendemain. Ils parlèrent de littérature, de voyages, de rêves. ${p.femme} était ${p.profession1} et écrivait ses propres histoires. Il lui proposa de les lire.`,

        climax: (p) => `Son éditeur voulait la publier, mais elle devait partir à ${p.lieu2} pour un an. Il la regarda partir, le cœur serré, mais lui promit d'attendre.`,

        fin: (p) => `Elle revint avec un livre dédicacé : "Pour celui qui m'a appris que l'amour se cache parfois dans les pages les plus inattendues." Il la prit dans ses bras. Aujourd'hui, la librairie s'appelle "Chez ${p.femme} et ${p.homme}".`

    },

    {

        intro: (p) => `Sur les toits de ${p.lieu1}, une silhouette dansait sous la lune. ${p.femme}, danseuse étoile, répétait inlassablement ses mouvements. En bas, ${p.homme} la regardait, fasciné.`,

        milieu: (p) => `Il était ${p.profession1} et jouait du saxophone dans un club de jazz. Un soir, il l'invita à l'écouter. Elle vint, et la magie opéra.`,

        developpement: (p) => `Ils devinrent inséparables. Lui jouait pendant qu'elle dansait, créant des spectacles improvisés sur les toits de la ville. Le public les adorait.`,

        climax: (p) => `Une compagnie de danse prestigieuse lui offrit un contrat à ${p.lieu2}. Elle hésita, déchirée entre sa carrière et son amour.`,

        fin: (p) => `Il décida de la suivre. Aujourd'hui, ils se produisent ensemble sur les plus grandes scènes du monde, et chaque spectacle commence par une danse sur les toits.`

    }

];

const structuresAventure = [

    {

        intro: (p) => `Le capitaine ${p.homme} n'avait jamais cru aux légendes. Pourtant, lorsque le vieux cartographe ${p.nom} lui tendit une carte en murmurant "Le trésor existe", il sentit son cœur s'emballer.`,

        milieu: (p) => `L'expédition commença sous les meilleurs auspices. Le navire fendait les flots avec grâce, emportant vingt hommes déterminés. ${p.femme}, la seule femme à bord, était la plus courageuse de tous.`,

        developpement: (p) => `Après des semaines de navigation, une tempête les surprit. Le navire fut endommagé, mais ils atteignirent l'île mystérieuse. Sur la plage, ils découvrirent des ruines anciennes.`,

        climax: (p) => `Au cœur de la jungle, ils affrontèrent des pièges redoutables. ${p.homme} tomba dans une fosse, mais ${p.femme} le sauva. Ensemble, ils trouvèrent la salle du trésor.`,

        fin: (p) => `Le trésor n'était pas de l'or, mais un journal racontant l'histoire de ceux qui avaient cherché avant eux. Ils rentrèrent chez eux, riches d'une amitié éternelle et d'une histoire à raconter.`

    },

    {

        intro: (p) => `Le professeur ${p.nom}, éminent archéologue, avait passé sa vie à chercher la cité perdue de ${p.lieu1}. Accompagné de sa fille ${p.femme} et de son assistant ${p.homme}, il se lança dans une dernière expédition.`,

        milieu: (p) => `Dans la jungle amazonienne, ils découvrirent des ruines que personne n'avait jamais vues. Des statues étranges les regardaient, et ${p.femme} trouva une inscription dans une langue inconnue.`,

        developpement: (p) => `Ils pénétrèrent dans un temple et déclenchèrent un piège. ${p.homme} fut séparé des autres. Errant dans les couloirs, il trouva une salle remplie d'or.`,

        climax: (p) => `Les murs se rapprochèrent. ${p.femme} et son père le cherchaient désespérément. Au dernier moment, elle le trouva et le tira de là.`,

        fin: (p) => `Ils sortirent du temple alors qu'il s'effondrait. Ils n'avaient pas d'or, mais ils avaient survécu ensemble. ${p.homme} et ${p.femme} se marièrent un an plus tard, et le professeur écrivit un livre sur leur aventure.`

    }

];

const structuresAction = [

    {

        intro: (p) => `L'agent ${p.homme} était le meilleur élément de l'agence. Quand l'alerte rouge retentit, il sut que cette mission serait différente. Des terroristes avaient pris le contrôle de ${p.lieu1}, avec 300 otages.`,

        milieu: (p) => `Il s'infiltra de nuit, escaladant les murs avec une agilité féline. ${p.femme}, analyste de l'agence, le guidait à distance. "Attention, deux gardes à droite", murmura-t-elle.`,

        developpement: (p) => `Il les neutralisa sans un bruit et continua sa progression. Dans la salle de contrôle, le chef des terroristes l'attendait. "Je savais que tu viendrais, ${p.homme}."`,

        climax: (p) => `Un combat à mort s'engagea. ${p.homme} fut blessé, mais il ne lâcha pas prise. ${p.femme} lui cria : "Il va faire exploser le bâtiment ! Plus que 5 minutes !"`,

        fin: (p) => `Il neutralisa le chef, évacua les otages, et s'enfuit au moment où le bâtiment explosait. ${p.femme} l'attendait, les larmes aux yeux. Ils s'embrassèrent. La mission était accomplie.`

    },

    {

        intro: (p) => `La ville de ${p.lieu1} était plongée dans le chaos. Des gangs rivaux s'affrontaient dans les rues. L'inspecteur ${p.femme} était la seule à pouvoir ramener la paix.`,

        milieu: (p) => `Elle découvrit que les chefs des gangs avaient un passé commun. ${p.homme}, son ancien coéquipier, était devenu l'un d'eux. Elle refusait d'y croire.`,

        developpement: (p) => `Elle le confronta dans un entrepôt abandonné. "Pourquoi ?" lui demanda-t-elle. Il lui expliqua qu'il avait été piégé. Ensemble, ils décidèrent de nettoyer la ville.`,

        climax: (p) => `Ils affrontèrent le vrai criminel, un politicien corrompu. Le combat fut sanglant. ${p.homme} prit une balle pour la protéger.`,

        fin: (p) => `Le politicien fut arrêté. ${p.homme} survécut. Il reprit sa place auprès d'elle, et ensemble, ils reconstruisirent la ville. La paix était revenue.`

    }

];

const structuresHumour = [

    {

        intro: (p) => `${p.homme} était un homme ordinaire avec un talent extraordinaire : celui de tout rater. Ce jour-là, sa femme ${p.femme} lui avait demandé de préparer le dîner pour l'anniversaire de sa belle-mère.`,

        milieu: (p) => `Il suivit la recette à la lettre, mais confondit le sel avec le sucre. Le résultat fut un gâteau... spécial. Quand il le servit, ${p.femme} prit une bouchée, devint toute rouge, mais continua de mâcher.`,

        developpement: (p) => `Leur fils de 6 ans s'écria : "Papa, on dirait que t'as mis de la mer !" Tout le monde se figea. La belle-mère le regarda avec des yeux meurtriers.`,

        climax: (p) => `${p.homme} tenta de se rattraper en proposant une pizza. Il commanda, mais se trompa d'adresse. La pizza arriva chez les voisins, qui la mangèrent.`,

        fin: (p) => `Aujourd'hui, ${p.homme} n'a plus le droit de cuisiner. Sa belle-mère lui a pardonné, mais elle apporte toujours un plat fait maison quand elle vient dîner.`

    },

    {

        intro: (p) => `${p.femme} vivait seule avec son chat ${p.animal}. Sa vie était tranquille, trop tranquille au goût de sa mère. Pour lui prouver qu'elle pouvait être responsable, elle décida d'adopter un deuxième chat.`,

        milieu: (p) => `Les deux chats se battaient comme des chiffonniers. Un jour, en rentrant, elle trouva son appartement sens dessus dessous. Les deux chats, assis au milieu du chaos, la regardaient avec des airs innocents.`,

        developpement: (p) => `Elle essaya tout : des sprays, des colliers, même un psychologue pour chats. Rien n'y faisait. La goutte d'eau fut quand ils déclenchèrent l'alarme incendie.`,

        climax: (p) => `Les pompiers défoncèrent la porte pour découvrir deux chats assis sagement, et ${p.femme} en peignoir, furieuse.`,

        fin: (p) => `Elle finit par accepter son destin. Aujourd'hui, elle poste leurs aventures sur internet et est suivie par des millions de personnes.`

    }

];

const structuresFantastique = [

    {

        intro: (p) => `Dans le village de ${p.lieu1}, on racontait que la forêt voisine abritait les âmes des disparus. ${p.femme}, dont la grand-mère venait de mourir, décida d'y aller pour lui dire adieu.`,

        milieu: (p) => `Guidée par une lueur étrange, elle marcha longtemps. Soudain, elle vit des milliers de petites lumières danser entre les arbres. L'une d'elles s'approcha et prit la forme de sa grand-mère.`,

        developpement: (p) => `"N'aie pas peur, ma petite", dit la lumière. "Nous sommes ici, en paix. La forêt est un passage, pas une prison." ${p.femme} comprit alors que la mort n'était qu'une transition.`,

        climax: (p) => `Une tempête se leva. Les âmes, agitées, se mirent à tourbillonner. "Le passage se ferme ! Tu dois partir !" cria sa grand-mère.`,

        fin: (p) => `${p.femme} sortit de la forêt au petit matin. Elle n'avait plus peur de la mort. Chaque année, elle retourne dans la forêt, et les lumières dansent pour elle.`

    },

    {

        intro: (p) => `En rangeant la bibliothèque de son grand-oncle, ${p.homme} trouva ${p.objet}. En l'ouvrant, une lumière aveuglante l'envahit.`,

        milieu: (p) => `Quand il rouvrit les yeux, il était dans un autre monde, où la magie existait vraiment. Des créatures fantastiques le regardaient.`,

        developpement: (p) => `Un vieux sorcier l'accueillit : "Tu es le premier humain à venir ici depuis des siècles. ${p.objet} t'a choisi." ${p.homme} passa un an à apprendre la magie.`,

        climax: (p) => `Il découvrit qu'un grand danger menaçait les deux mondes. Il devait trouver ${p.objet2} pour les sauver.`,

        fin: (p) => `Il réussit et retourna chez lui, emportant avec lui un peu de magie. Chaque nuit, il rêve de ce monde merveilleux.`

    }

];

const structuresAnime = [

    {

        intro: (p) => `Dans le village caché de ${p.lieu1}, un jeune garçon nommé ${p.homme} courait sur les toits, poursuivi par des villageois en colère. Rejeté depuis sa naissance, il rêvait pourtant de devenir le chef du village.`,

        milieu: (p) => `Il intégra l'académie, mais il était le cancre de la classe. Ses techniques échouaient, ses notes étaient catastrophiques. Pourtant, il ne baissa jamais les bras.`,

        developpement: (p) => `Son ami ${p.femme} croyait en lui. Elle l'encourageait, s'entraînait avec lui. Ensemble, ils devinrent plus forts.`,

        climax: (p) => `Lors de l'examen final, il affronta le redoutable ${p.homme2}. Personne ne croyait en sa victoire, mais il se battit avec tout son cœur.`,

        fin: (p) => `Il gagna, prouvant que la volonté pouvait changer le destin. Des années plus tard, il réalisa son rêve et devint chef du village, respecté de tous.`

    },

    {

        intro: (p) => `${p.homme} était le lycéen le plus brillant du Japon. Surdoué, beau, populaire, il s'ennuyait profondément. Jusqu'au jour où il trouva ${p.objet}.`,

        milieu: (p) => `En y écrivant le nom d'une personne, celle-ci mourait. Il décida de l'utiliser pour éliminer tous les criminels et créer un monde parfait.`,

        developpement: (p) => `Le détective ${p.femme} se mit sur l'affaire. Commença alors une guerre d'esprit sans merci entre les deux génies.`,

        climax: (p) => `La confrontation finale eut lieu dans un entrepôt. ${p.homme}, sûr de sa victoire, avait tout planifié. Mais il avait sous-estimé ${p.femme}.`,

        fin: (p) => `Il fut démasqué. Le cahier fut détruit, et le monde retrouva un équilibre précaire. Mais l'histoire de Kira resta gravée dans les mémoires.`

    },

    {

        intro: (p) => `${p.homme}, un garçon au corps élastique après avoir mangé un fruit du démon, rêvait de devenir le Roi des ${p.lieu2}. Il partit en mer dans une petite barque.`,

        milieu: (p) => `Il recruta ses premiers compagnons : ${p.femme}, une voleuse au grand cœur, et ${p.homme2}, un chasseur de primes devenu son ami.`,

        developpement: (p) => `Ils affrontèrent des pirates redoutables et le gouvernement mondial lui-même. À chaque île, ${p.homme} se faisait de nouveaux amis qu'il jurait de protéger.`,

        climax: (p) => `Pour sauver ${p.femme}, il déclara la guerre au gouvernement. Face à 8000 soldats, il se battit avec une rage folle.`,

                fin: (p) => `${p.femme} fut sauvée. L'équipage continua de naviguer, vivant de nouvelles aventures. Et ${p.homme}, toujours souriant, disait : "Je suis celui qui deviendra le Roi des Pirates !"`
    }
];

// ==================== FONCTION POUR GÉNÉRER UNE HISTOIRE ALÉATOIRE ====================

function genererHistoire(category) {
    let structures;
    let titreBase = "";
    
    switch(category) {
        case 'amour':
            structures = structuresAmour;
            titreBase = "Une Histoire d'Amour";
            break;
        case 'aventure':
            structures = structuresAventure;
            titreBase = "Une Grande Aventure";
            break;
        case 'action':
            structures = structuresAction;
            titreBase = "Mission Action";
            break;
        case 'humour':
            structures = structuresHumour;
            titreBase = "Une Histoire Drôle";
            break;
        case 'fantastique':
            structures = structuresFantastique;
            titreBase = "Conte Fantastique";
            break;
        case 'anime':
            structures = structuresAnime;
            titreBase = "Inspiré d'Animé";
            break;
        default:
            return null;
    }
    
    // Générer des personnages aléatoires
    const personnage1 = getRandomNomComplet();
    const personnage2 = getRandomNomComplet();
    const couple = getRandomCouple();
    
    // Créer un objet avec tous les paramètres
    const params = {
        homme: getRandomPrenomHomme(),
        femme: getRandomPrenomFemme(),
        nom: getRandomNomFamille(),
        lieu1: getRandomLieu(),
        lieu2: getRandomLieu(),
        lieu3: getRandomLieu(),
        profession1: getRandomProfession(),
        profession2: getRandomProfession(),
        passion: Math.random() > 0.5 ? "la littérature" : "la musique",
        animal: getRandomAnimal(),
        objet: getRandomObjetMagique(),
        objet2: getRandomObjetMagique(),
        homme2: getRandomPrenomHomme(),
        femme2: getRandomPrenomFemme()
    };
    
    // Sélection aléatoire d'une structure
    const structure = structures[Math.floor(Math.random() * structures.length)];
    
    // Générer chaque partie avec les paramètres
    const intro = structure.intro(params);
    const milieu = structure.milieu(params);
    const developpement = structure.developpement(params);
    const climax = structure.climax(params);
    const fin = structure.fin(params);
    
    // Titre unique
    const titre = `${titreBase} à ${params.lieu1}`;
    
    return { titre, histoire: `${intro}\n\n${milieu}\n\n${developpement}\n\n${climax}\n\n${fin}` };
}

async function histoireCommand(sock, message) {
    try {
        const remoteJid = message.key?.remoteJid;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.slice(9).trim().toLowerCase();

        if (!args) {
            const helpMessage = 
                "╔══════════════════╗\n" +
                "     *HISTOIRES*    \n" +
                "╚══════════════════╝\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "📖 *Bienvenue dans le monde des histoires !*\n\n" +
                "📝 *Commandes disponibles:*\n\n" +
                "`.histoire amour`       - Histoire d'amour 💕\n" +
                "`.histoire aventure`     - Histoire d'aventure ⚔️\n" +
                "`.histoire action`       - Histoire d'action 💥\n" +
                "`.histoire humour`       - Histoire humoristique 😂\n" +
                "`.histoire fantastique`  - Histoire fantastique ✨\n" +
                "`.histoire anime`        - Histoires d'animés 🎌\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +
                `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +
                "> *_© AKANE-MD 🌹_*";

            return await sock.sendMessage(remoteJid, { text: helpMessage });
        }

        const categories = {
            'amour': { emoji: '💕', name: 'Amour' },
            'aventure': { emoji: '⚔️', name: 'Aventure' },
            'action': { emoji: '💥', name: 'Action' },
            'humour': { emoji: '😂', name: 'Humour' },
            'fantastique': { emoji: '✨', name: 'Fantastique' },
            'anime': { emoji: '🎌', name: 'Anime' }
        };

        if (!categories[args]) {
            const errorMessage = 
                "╔══════════════════╗\n" +
                "      *ERREUR*      \n" +
                "╚══════════════════╝\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "❌ *Catégorie d'histoire inconnue !*\n\n" +
                "📝 *Catégories disponibles:*\n" +
                "• amour 💕\n" +
                "• aventure ⚔️\n" +
                "• action 💥\n" +
                "• humour 😂\n" +
                "• fantastique ✨\n" +
                "• anime 🎌\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +
                `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +
                "> *_© AKANE-MD 🌹_*";

            return await sock.sendMessage(remoteJid, { text: errorMessage });
        }

        await sock.sendMessage(remoteJid, { 
            text: `📖 *Génération d'une histoire ${categories[args].emoji}...*` 
        });

        const resultat = genererHistoire(args);

        if (!resultat) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Désolé, aucune histoire trouvée dans cette catégorie !*" 
            });
        }

        const storyMessage = 
            "╔══════════════════╗\n" +
            `  *${categories[args].emoji} ${resultat.titre} ${categories[args].emoji}*  \n` +
            "╚══════════════════╝\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            `${resultat.histoire}\n\n` +
            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +
            `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +
            "> *_© AKANE-MD 🌹_*";

        if (storyMessage.length > 4000) {
            const parties = [];
            let currentPart = "";
            const lines = storyMessage.split('\n');
            
            for (const line of lines) {
                if (currentPart.length + line.length > 3500) {
                    parties.push(currentPart);
                    currentPart = line + '\n';
                } else {
                    currentPart += line + '\n';
                }
            }
            if (currentPart) parties.push(currentPart);
            
            for (let i = 0; i < parties.length; i++) {
                const partMessage = i === 0 ? parties[i] : 
                    "╔══════════════════╗\n" +
                    `  *${categories[args].emoji} ${resultat.titre} (Suite ${i}/${parties.length-1}) ${categories[args].emoji}*  \n` +
                    "╚══════════════════╝\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    parties[i] + '\n\n' +
                    "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +
                    `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +
                    "> *_© AKANE-MD 🌹_*";
                
                await sock.sendMessage(remoteJid, { text: partMessage });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            await sock.sendMessage(remoteJid, { text: storyMessage });
        }

    } catch (error) {
        console.error('Erreur histoireCommand:', error);
        
        const remoteJid = message.key?.remoteJid;
        
        const errorMessage = 
            "╔══════════════════╗\n" +
            "      *ERREUR*      \n" +
            "╚══════════════════╝\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "❌ *Erreur lors de la génération de l'histoire*\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +
            `*VOIR LA CHAÎNE* 🔥\n${CHANNEL_LINK}\n\n` +
            "> *_© AKANE-MD 🌹_*";

        await sock.sendMessage(remoteJid, { text: errorMessage });
    }
}

export default histoireCommand;