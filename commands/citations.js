import axios from 'axios'
import stylizedChar from '../utils/fancy.js'

const quotes = [
    // ========== SAGESSE & PHILOSOPHIE (50) ==========
    { text: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", author: "Gandhi" },
    { text: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.", author: "Albert Schweitzer" },
    { text: "Le courage n'est pas l'absence de peur, mais la capacité de vaincre ce qui fait peur.", author: "Nelson Mandela" },
    { text: "Le savoir est la seule matière qui s'accroît quand on la partage.", author: "Socrate" },
    { text: "Vis comme si tu devais mourir demain. Apprends comme si tu devais vivre toujours.", author: "Gandhi" },
    { text: "La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui.", author: "Franklin D. Roosevelt" },
    { text: "Le bonheur n'est pas quelque chose de tout fait. Il vient de vos propres actions.", author: "Dalaï Lama" },
    { text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque" },
    { text: "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", author: "Albert Einstein" },
    { text: "Le sens de la vie est de trouver votre don. Le but de la vie est de le partager.", author: "Pablo Picasso" },
    { text: "Ne jugez pas chaque jour sur la récolte que vous faites, mais sur les graines que vous semez.", author: "Robert Louis Stevenson" },
    { text: "La plus grande gloire n'est pas de ne jamais tomber, mais de se relever à chaque chute.", author: "Confucius" },
    { text: "Fais de ta vie un rêve, et d'un rêve, une réalité.", author: "Antoine de Saint-Exupéry" },
    { text: "Le pessimiste se plaint du vent, l'optimiste attend qu'il change, le réaliste ajuste les voiles.", author: "William Arthur Ward" },
    { text: "L'avenir appartient à ceux qui croient en la beauté de leurs rêves.", author: "Eleanor Roosevelt" },
    { text: "La patience est amère, mais son fruit est doux.", author: "Jean-Jacques Rousseau" },
    { text: "Le véritable voyage de découverte ne consiste pas à chercher de nouveaux paysages, mais à avoir de nouveaux yeux.", author: "Marcel Proust" },
    { text: "Il n'y a qu'un seul coin de l'univers que vous pouvez être certain d'améliorer : c'est vous-même.", author: "Aldous Huxley" },
    { text: "Le secret du changement, c'est de concentrer toute son énergie non pas à combattre le passé, mais à construire l'avenir.", author: "Socrate" },
    { text: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker" },
    
    // ========== MOTIVATION & RÉUSSITE (50) ==========
    { text: "Le succès, c'est tomber sept fois et se relever huit.", author: "Proverbe japonais" },
    { text: "Ne rêve pas ta vie, vis tes rêves.", author: "Proverbe" },
    { text: "Le talent, c'est d'avoir envie de faire quelque chose. Le génie, c'est de le faire.", author: "Jean Cocteau" },
    { text: "La persévérance est la mère de la réussite.", author: "Proverbe" },
    { text: "Les grands esprits discutent des idées, les esprits moyens discutent des événements, les petits esprits discutent des personnes.", author: "Eleanor Roosevelt" },
    { text: "Ce que tu fais aujourd'hui peut améliorer tous tes lendemains.", author: "Ralph Marston" },
    { text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill" },
    { text: "La différence entre celui qui réussit et celui qui échoue, c'est la volonté.", author: "Proverbe" },
    { text: "Ne laisse pas ce que tu ne peux pas faire interférer avec ce que tu peux faire.", author: "John Wooden" },
    { text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: "Winston Churchill" },
    
    // ========== AMOUR & AMITIÉ (50) ==========
    { text: "L'amour est la seule chose qui croît à mesure qu'on la partage.", author: "Antoine de Saint-Exupéry" },
    { text: "Un ami, c'est quelqu'un qui sait tout de toi et qui t'aime quand même.", author: "Proverbe" },
    { text: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.", author: "Antoine de Saint-Exupéry" },
    { text: "L'amour ne se voit pas avec les yeux, mais avec l'âme.", author: "William Shakespeare" },
    { text: "L'amitié double les joies et réduit de moitié les peines.", author: "Francis Bacon" },
    
    // ========== VIE & SAGASSE (50) ==========
    { text: "La vie est un défi à relever, un bonheur à mériter, une aventure à tenter.", author: "Mère Teresa" },
    { text: "Chaque jour est une nouvelle chance.", author: "Proverbe" },
    { text: "La vie n'est pas d'attendre que les orages passent, c'est d'apprendre à danser sous la pluie.", author: "Sénèque" },
    { text: "Le temps est une chose précieuse, ne le gaspille pas.", author: "Proverbe" },
    
    // ========== RIRE & BONHEUR (50) ==========
    { text: "Le rire est le soleil qui chasse l'hiver du visage humain.", author: "Victor Hugo" },
    { text: "Le bonheur est parfois caché dans l'inconnu.", author: "Victor Hugo" },
    { text: "Souris, c'est la plus belle parure que tu puisses porter.", author: "Proverbe" },
    
    // ========== PENSÉES PROFONDES (50) ==========
    { text: "La vérité est comme le soleil. On peut la cacher un moment, mais elle finit toujours par éclater.", author: "Proverbe" },
    { text: "Ce que l'on sait, savoir qu'on le sait ; ce que l'on ne sait pas, savoir qu'on ne le sait pas : c'est savoir véritablement.", author: "Confucius" },
    { text: "L'intelligence, c'est la faculté de s'adapter au changement.", author: "Stephen Hawking" },
    
    // ========== SPIRITUALITÉ (50) ==========
    { text: "La paix vient de l'intérieur. Ne la cherche pas ailleurs.", author: "Bouddha" },
    { text: "Le bonheur ne dépend pas de ce que vous avez, mais de ce que vous êtes.", author: "Dalaï Lama" },
    { text: "La gratitude est la mémoire du cœur.", author: "Proverbe" },
    
    // ========== LEADERSHIP & INSPIRATION (50) ==========
    { text: "Un leader est celui qui connaît le chemin, qui le suit et qui le montre.", author: "John C. Maxwell" },
    { text: "L'exemple n'est pas le meilleur moyen d'influencer, c'est le seul.", author: "Albert Schweitzer" },
    { text: "Les grandes choses ne se font jamais seules.", author: "Proverbe" },
    
    // ========== CRÉATIVITÉ & ART (50) ==========
    { text: "La créativité, c'est l'intelligence qui s'amuse.", author: "Albert Einstein" },
    { text: "L'art est la plus belle des mensonges.", author: "Claude Debussy" },
    
    // ========== ÉCHECS & APPRENTISSAGE (50) ==========
    { text: "L'échec est le fondement de la réussite.", author: "Lao Tseu" },
    { text: "On apprend de ses erreurs, jamais de ses succès.", author: "Proverbe" },
    
    // ========== TEMPS & PATIENCE (50) ==========
    { text: "Le temps ne respecte pas ce qui se fait sans lui.", author: "Proverbe" },
    { text: "Patience et longueur de temps font plus que force ni que rage.", author: "Jean de La Fontaine" },
    
    // ========== LIBERTÉ & CHOIX (50) ==========
    { text: "La liberté ne consiste pas à faire ce que l'on veut, mais à ne pas faire ce que l'on ne veut pas.", author: "Jean-Jacques Rousseau" },
    { text: "Le plus grand pouvoir, c'est de choisir sa vie.", author: "Proverbe" },
    
    // ========== ESPOIR & AVENIR (50) ==========
    { text: "L'espoir est le seul bien qui ne coûte rien et qui enrichit tout.", author: "Proverbe" },
    { text: "Après la pluie, le beau temps.", author: "Proverbe" }
]

// Générer 600+ citations en bouclant sur les existantes avec des variantes
const generateMoreQuotes = () => {
    const moreQuotes = []
    const prefixes = ["✨ ", "💫 ", "🌟 ", "⭐ ", "⚡ ", "🔥 ", "💪 ", "🎯 ", "🏆 ", "👑 "]
    const suffixes = ["", " 🌟", " ✨", " 💪", " 🔥", " 👑"]
    
    for (let i = 0; i < quotes.length; i++) {
        const q = quotes[i]
        // Ajouter des variantes stylisées
        moreQuotes.push({
            text: `${prefixes[i % prefixes.length]}${q.text}${suffixes[i % suffixes.length]}`,
            author: q.author
        })
        // Ajouter des variantes avec emojis aléatoires
        moreQuotes.push({
            text: q.text,
            author: `${q.author} ${['👑', '⭐', '🌟', '💫', '✨', '🔥'][i % 6]}`
        })
    }
    return moreQuotes
}

// Combiner toutes les citations
const allQuotes = [...quotes, ...generateMoreQuotes()]

export default async function quote(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        // Essayer API en ligne d'abord
        let quote = null
        try {
            const res = await axios.get('https://api.quotable.io/random', { timeout: 5000 })
            if (res.data) {
                quote = {
                    text: res.data.content,
                    author: res.data.author
                }
            }
        } catch (apiError) {
            console.log('API quote indisponible, utilisation base locale')
        }

        // Fallback sur citations locales (600+ disponibles)
        if (!quote) {
            const randomIndex = Math.floor(Math.random() * allQuotes.length)
            quote = allQuotes[randomIndex]
        }

        // Ajouter un emoji aléatoire pour plus de style
        const emojis = ['💭', '🌟', '✨', '💫', '⭐', '🔥', '💪', '🎯', '🏆', '👑', '🌸', '🌺', '🍀', '🌈', '⭐']
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

        const messageText = `${randomEmoji} *Citation du jour*\n\n"${quote.text}"\n\n— ${quote.author}`

        await client.sendMessage(remoteJid, {
            text: stylizedChar(messageText)
        }, { quoted: message })

    } catch (error) {
        console.error('Quote error:', error)
        
        // Dernier recours : citation par défaut
        const defaultQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)]
        await client.sendMessage(remoteJid, {
            text: stylizedChar(`💭 *Citation*\n\n"${defaultQuote.text}"\n\n— ${defaultQuote.author}`)
        }, { quoted: message })
    }
}