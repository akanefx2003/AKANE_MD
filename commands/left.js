// commands/bye.js
export default async function byeCommand(client, message) {
    const remoteJid = message.key.remoteJid;

    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: "❌ *Groupes uniquement*" });
        return;
    }

    await client.sendMessage(remoteJid, { text: `
﹝╎🍓 𝐀𝐔 𝐑𝐄𝐕𝐎𝐈𝐑 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 ⪨
⸙﹝ 👋 Bye bye les losers ! ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` });
    
    await client.groupLeave(remoteJid);
}