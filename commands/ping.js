// commands/ping.js
export default async function ping(client, message) {
    const remoteJid = message.key.remoteJid;
    const start = Date.now();
    
    const sent = await client.sendMessage(remoteJid, { text: "⏳ *Calcul...*" });
    const end = Date.now();
    const ms = end - start;

    await client.sendMessage(remoteJid, {
        text: `
﹝╎🍓 𝐏𝐈𝐍𝐆 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞 ⪨
⸙﹝ 🏓 ${ms}ms ﹞✴︎

⋆.˚⪩ 𝐒𝐭𝐚𝐭𝐮𝐭 ⪨
⸙﹝ ✅ En ligne ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`,
        edit: sent.key
    });
}