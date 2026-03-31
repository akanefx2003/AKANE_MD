const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

export default async function parlerCommand(client, message) {

    const jid = message.key.remoteJid;

    const sender = message.key.participant || jid;

    try {

        if (!jid.endsWith("@g.us")) {

            return client.sendMessage(jid, { text: "❌ *Groupes uniquement*" }, { quoted: message });

        }

        const metadata = await client.groupMetadata(jid);

        const admins = metadata.participants.filter(p => p.admin);

        const isAdmin = admins.some(p => p.id === sender);

        if (!isAdmin) {

            return client.sendMessage(jid, { text: "❌ *Tu dois etre admin*" }, { quoted: message });

        }

        await client.groupSettingUpdate(jid, "not_announcement");

        const participants = metadata.participants.map(p => p.id);

        const openMessage = 

            "╔════════════╗\n" +

            "  *PARLER*  \n" +

            "╚════════════╝\n\n" +

            "🔊 *Groupe ouvert*\n\n" +

            "🗣️ *Tout le monde peut parler !*\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await client.sendMessage(jid, { text: openMessage, mentions: participants }, { quoted: message });

    } catch (e) {

        console.log(e);

        client.sendMessage(jid, { text: "❌ *Le bot doit etre admin*" }, { quoted: message });

    }

}