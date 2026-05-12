export default async function demoteAllCommand(client, message) {

    const jid = message.key.remoteJid;

    if (!jid.endsWith('@g.us')) {

        return client.sendMessage(jid, { text: '❌ *Groupes uniquement*' }, { quoted: message });

    }

    // L'expéditeur de la commande

    const sender = message.key.participant || jid;

    try {

        const metadata = await client.groupMetadata(jid);

        const participants = metadata.participants;

        const admins = participants.filter(p => p.admin);

        const isAdmin = admins.some(p => p.id === sender);

        if (!isAdmin) {

            return client.sendMessage(jid, { text: '❌ *Tu dois être admin*' }, { quoted: message });

        }

        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';

        // MISE À JOUR : On filtre pour exclure le bot ET l'expéditeur (toi)

        const adminsToDemote = admins

            .filter(p => p.id !== botId && p.id !== sender) 

            .map(p => p.id);

        if (adminsToDemote.length === 0) {

            return client.sendMessage(jid, { text: 'ℹ️ *Aucun autre admin à révoquer.*' }, { quoted: message });

        }

        // Exécution

        await client.groupParticipantsUpdate(jid, adminsToDemote, "demote");

        await client.sendMessage(jid, { 

            text: `✅ *Action terminée.*\n\nJ'ai révoqué ${adminsToDemote.length} administrateurs. Tu es toujours admin (et moi aussi).` 

        }, { quoted: message });

    } catch (e) {

        console.error(e);

        client.sendMessage(jid, { text: '❌ *Erreur*' }, { quoted: message });

    }

}