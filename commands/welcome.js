import fs from 'fs';

const WELCOME_FILE = 'welcome.json';

function loadWelcomeConfig() {
    if (fs.existsSync(WELCOME_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(WELCOME_FILE, 'utf-8'));
        } catch (e) {
            return { groups: [] };
        }
    }
    return { groups: [] };
}

function saveWelcomeConfig(config) {
    fs.writeFileSync(WELCOME_FILE, JSON.stringify(config, null, 2));
}

function isWelcomeEnabled(groupJid) {
    const config = loadWelcomeConfig();
    return config.groups.includes(groupJid);
}

function enableWelcome(groupJid) {
    const config = loadWelcomeConfig();
    if (!config.groups.includes(groupJid)) {
        config.groups.push(groupJid);
        saveWelcomeConfig(config);
    }
}

function disableWelcome(groupJid) {
    const config = loadWelcomeConfig();
    config.groups = config.groups.filter(g => g !== groupJid);
    saveWelcomeConfig(config);
}

export default async function welcomeCommand(client, message) {
    const jid = message.key.remoteJid;
    
    if (!jid.endsWith('@g.us')) {
        return client.sendMessage(jid, { text: '❌ *Groupes uniquement*' }, { quoted: message });
    }

    const sender = message.key.participant || jid;
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = text.split(/\s+/).slice(1);
    const action = args[0]?.toLowerCase();

    try {
        const metadata = await client.groupMetadata(jid);
        const admins = metadata.participants.filter(p => p.admin);
        const isAdmin = admins.some(p => p.id === sender);
        
        switch (action) {
            case 'on':
                if (!isAdmin) {
                    return client.sendMessage(jid, { text: '❌ *Tu dois être admin*' }, { quoted: message });
                }
                enableWelcome(jid);
                await client.sendMessage(jid, { 
                    text: '✅ *Welcome activé* pour ce groupe !' 
                }, { quoted: message });
                break;

            case 'off':
                if (!isAdmin) {
                    return client.sendMessage(jid, { text: '❌ *Tu dois être admin*' }, { quoted: message });
                }
                disableWelcome(jid);
                await client.sendMessage(jid, { 
                    text: '❌ *Welcome désactivé* pour ce groupe !' 
                }, { quoted: message });
                break;

            default:
                const enabled = isWelcomeEnabled(jid);
                await client.sendMessage(jid, { 
                    text: `📝 *Welcome*\n\nStatut: ${enabled ? '✅ Activé' : '❌ Désactivé'}\n\nUsage:\n.welcome on\n.welcome off` 
                }, { quoted: message });
        }
    } catch (e) {
        console.log(e);
        client.sendMessage(jid, { text: '❌ *Erreur*' }, { quoted: message });
    }
}

export { isWelcomeEnabled };