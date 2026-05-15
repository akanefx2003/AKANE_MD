export async function runtime(client, message) {

    const jid = message.key.remoteJid;

    

    // --- GÉNÉRATION DE FAUX PING (ENTRE 990 ET 1573) ---

    const fakePing = Math.floor(Math.random() * (1573 - 990 + 1)) + 990;

    // --- CALCUL DE L'UPTIME ---

    const uptimeSeconds = process.uptime();

    const days = Math.floor(uptimeSeconds / 86400);

    const hours = Math.floor((uptimeSeconds % 86400) / 3600);

    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    const seconds = Math.floor(uptimeSeconds % 60);

    const uptimeString = `${days > 0 ? `${days}j ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;

    // --- STATS RAM ---

    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const text = `﹝╎⏳ 𝐒𝐓𝐀𝐓𝐔𝐒 𝐀𝐊𝐀𝐍𝐄 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ✨ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

📡 *Statut :* *En ligne ✅*

🚀 *Vitesse :* *${fakePing} ms*

⏱️ *En vie depuis :* *${uptimeString}*

📂 *Mémoire :* *${ramUsage} MB / 1go*

> *© AKANE MD 🌹*`;

    await client.sendMessage(jid, { text: text }, { quoted: message });

}

export default runtime;

