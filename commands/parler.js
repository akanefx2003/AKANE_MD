// commands/parler.js
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

// Style BIBLE intégré (ne dépend d'aucun fichier) - sans affecter les liens
function styleBible(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = [];
    const textWithoutUrls = text.replace(urlRegex, (match) => {
        urls.push(match);
        return `__URL_${urls.length - 1}__`;
    });
    
    const map = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
        'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
        'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
        'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
        'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
        'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
        '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
        'é': '𝗲́', 'è': '𝗲̀', 'ê': '𝗲̂', 'ë': '𝗲̈',
        'à': '𝗮̀', 'â': '𝗮̂', 'ç': '𝗰̧', 'ô': '𝗼̂',
        ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?',
        '-': '-', '_': '_', '/': '/', '\\': '\\',
        '@': '@', '#': '#', '&': '&', '*': '*', '(': '(', ')': ')',
        '[': '[', ']': ']', '{': '{', '}': '}', '<': '<', '>': '>'
    };
    
    let styledText = textWithoutUrls.split('').map(char => map[char] || char).join('');
    urls.forEach((url, i) => {
        styledText = styledText.replace(`__URL_${i}__`, url);
    });
    return styledText;
}

export default async function parlerCommand(client, message) {
    const jid = message.key.remoteJid;
    const sender = message.key.participant || jid;

    try {
        if (!jid.endsWith("@g.us")) {
            const errorMsg = styleBible("❌ *Groupes uniquement*");
            return client.sendMessage(jid, { text: errorMsg }, { quoted: message });
        }

        const metadata = await client.groupMetadata(jid);
        const admins = metadata.participants.filter(p => p.admin);
        const isAdmin = admins.some(p => p.id === sender);

        if (!isAdmin) {
            const errorMsg = styleBible("❌ *Tu dois etre admin*");
            return client.sendMessage(jid, { text: errorMsg }, { quoted: message });
        }

        await client.groupSettingUpdate(jid, "not_announcement");

        const participants = metadata.participants.map(p => p.id);
        
        const openMessage = 
`╭─❍ *🔊 PARLER*
│
│ 🗣️ *Groupe ouvert*
│
│ *Tout le monde peut parler !*
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
        
        const styledMessage = styleBible(openMessage);
        await client.sendMessage(jid, { text: styledMessage, mentions: participants }, { quoted: message });

    } catch (e) {
        console.log(e);
        const errorMsg = styleBible("❌ *Le bot doit etre admin*");
        client.sendMessage(jid, { text: errorMsg }, { quoted: message });
    }
}