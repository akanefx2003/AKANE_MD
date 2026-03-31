// commands/bye.js

// @cat: gc-menu

// Quitter un groupe

async function byeCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const isGroup = remoteJid.includes('g.us');

    

    if (!isGroup) {

        await client.sendMessage(remoteJid, { text: "> *Cette commande n'est disponible que dans un groupe idiot ðŸ’ !*" });

        return;

    }

    

    await client.sendMessage(remoteJid, { text: "> *_A DIOS BANDE DE LOSER_ ðŸ’*" });

    await client.groupLeave(remoteJid);

}

export default byeCommand;