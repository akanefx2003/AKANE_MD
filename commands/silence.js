const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

export default async function silenceCommand(client, message) {

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

        await client.groupSettingUpdate(jid, "announcement");

        const successMessage = 

            "╔════════════╗\n" +

            "  *SILENCE*  \n" +

            "╚════════════╝\n\n" +

            "🔇 *Groupe ferme*\n\n" +

            "📝 *Seuls les admins peuvent parler*\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await client.sendMessage(jid, { text: successMessage }, { quoted: message });

    } catch (e) {

        console.log(e);

        client.sendMessage(jid, { text: "❌ *Le bot doit etre admin*" }, { quoted: message });

    }

}