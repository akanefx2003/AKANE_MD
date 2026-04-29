// commands/style.js - Styles décoratifs
export default async function style(client, message, args) {
    const remoteJid = message.key.remoteJid;
    
    if (args.length < 1) {
        let listText = `╭━━━❰ *STYLES DÉCORATIFS* ❱━━━╮\n┃\n`;
        
        const symbols = [
            '★', '✦', '✧', '♤', '♡', '♢', '♧', '☆', '✿', '❀',
            '✤', '✪', '✯', '𒀭', '𓊈', '♡', '𓊉', '𝕮', '⑅', '⚡',
            '᭄⁩', '᭄⁩', '☣', '⚙', '⌘', '◈', '◉', '◎', '◍', '◖',
            '◗', '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠',
            '◡', '◢', '◣', '◤', '◥', '◦', '◧', '◨', '◩', '◪',
            '—͟͟͞͞', '𖣔', '᭄', '𓂀', '𐂂', '✙', '⚉', '⟡', '⟢', '⟣',
            '⟤', '⟥', '⦿', '⬤', '『', '』', '𝄟⃝', '꧁', '꧂', '〩',
            '༄', '᭄٭', '୨ৎ', '⁩', '-ّْ͢', '⸙', '️ۧ', 'Ꭾꨧ⃪ֹ︨︧︡︠ꦼ᭄', '𒋲'
        ];
        
        for (let i = 0; i < symbols.length; i++) {
            const num = (i + 1).toString().padStart(2, ' ');
            let displaySymbol = symbols[i];
            if (displaySymbol.length > 12) displaySymbol = displaySymbol.substring(0, 10) + '…';
            listText += `┃  ${num}. ${displaySymbol}\n`;
        }
        
        listText += `┃\n┃  ✨ 0 = aléatoire\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        listText += `📝 .style <numéro>\n📌 .style 14\n\n> *AKANE MD 🍁*`;
        
        await client.sendMessage(remoteJid, { text: listText });
        return;
    }
    
    let styleNum = parseInt(args[0]);
    
    const symbols = [
        '★', '✦', '✧', '♤', '♡', '♢', '♧', '☆', '✿', '❀',
        '✤', '✪', '✯', '𒀭', '𓊈', '𓊉', '𝕮', '⑅', '⚡', '᭄⁩',
        '᭄⁩', '☣', '⚙', '⌘', '◈', '◉', '◎', '◍', '◖', '◗',
        '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠', '◡',
        '◢', '◣', '◤', '◥', '◦', '◧', '◨', '◩', '◪', '—͟͟͞͞',
        '𖣔', '᭄', '𓂀', '𐂂', '✙', '⚉', '⟡', '⟢', '⟣', '⟤',
        '⟥', '⦿', '⬤', '『', '』', '𝄟⃝', '꧁', '꧂', '〩', '༄',
        '᭄٭', '୨ৎ', '⁩', '-ّْ͢', '⸙', '️ۧ', 'Ꭾꨧ⃪ֹ︨︧︡︠ꦼ᭄', '𒋲'
    ];
    
    if (isNaN(styleNum) || styleNum === 0 || args[0].toLowerCase() === 'aleatoire') {
        styleNum = Math.floor(Math.random() * symbols.length) + 1;
    }
    
    if (styleNum < 1 || styleNum > symbols.length) {
        await client.sendMessage(remoteJid, { text: `❌ Style ${styleNum} introuvable.` });
        return;
    }
    
    const symbol = symbols[styleNum - 1];
    
    await client.sendMessage(remoteJid, { text: symbol });
}