import configmanager from '../utils/configmanager.js';

const IMG_PREFIX_CHANGE = 'https://raw.githubusercontent.com/toge021/Media/main/f040.jpg';
const IMG_PREFIX_HELP   = 'https://raw.githubusercontent.com/toge021/Media/main/bba9.jpg';

function isEmoji(str) {

    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;

    return emojiRegex.test(str);

}

async function setprefix(message, client) {

    const number = client.user.id.split(':')[0];

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) throw new Error("Message JID is undefined.");

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const commandAndArgs = messageBody.slice(1).trim();

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        if (args.length > 0) {

            const newPrefix = args[0];

            if (!configmanager.config.users[number]) configmanager.config.users[number] = {};

            const oldPrefix = configmanager.config.users[number].prefix || ".";

            configmanager.config.users[number].prefix = newPrefix;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                image: { url: IMG_PREFIX_CHANGE },
                caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊✅ PRÉFIXE CHANGÉ AVEC SUCCÈS !*
┊
*┊🍉 ANCIEN PRÉFIXE : ${oldPrefix}*
*┊🍒 NOUVEAU PRÉFIXE : ${newPrefix}*
┊
*┊💡 UTILISE MAINTENANT*
*┊${newPrefix}HELP POUR VOIR LES COMMANDES*
┊
╰───────────────────❂`

            });

        } else {

            const currentPrefix = configmanager.config.users[number]?.prefix || ".";

            await client.sendMessage(remoteJid, {

                image: { url: IMG_PREFIX_HELP },
                caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊⚙️ PRÉFIXE ACTUEL : ${currentPrefix}*
┊
*┊📝 POUR CHANGER :*
*┊${currentPrefix}SETPREFIX <NOUVEAU_PRÉFIXE>*
┊
*┊💡 EXEMPLE :*
*┊${currentPrefix}SETPREFIX !*
┊
╰───────────────────❂`

            });

        }

    } catch (error) {

        await client.sendMessage(message.key.remoteJid, {

            text: '❌ Erreur : ' + error.message

        });

    }

}

async function setreaction(message, client) {

    const number = client.user.id.split(':')[0];

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) throw new Error("Message JID is undefined.");

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const commandAndArgs = messageBody.slice(1).trim();

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        if (args.length > 0 && isEmoji(args[0])) {

            const reactionEmoji = args[0];

            if (!configmanager.config.users[number]) configmanager.config.users[number] = {};

            const oldEmoji = configmanager.config.users[number].reaction || "🌹";

            configmanager.config.users[number].reaction = reactionEmoji;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: `✅ *Réaction changée avec succès !*\n\n🌹 Ancienne réaction : ${oldEmoji}\n🌹 Nouvelle réaction : ${reactionEmoji}`

            });

        } else {

            const currentEmoji = configmanager.config.users[number]?.reaction || "🌹";

            await client.sendMessage(remoteJid, {

                text: `🌹 *Réaction actuelle :* ${currentEmoji}\n\n📝 Pour changer : *${configmanager.config.users[number]?.prefix || "."}setreaction <emoji>*\n\n💡 Exemple : *${configmanager.config.users[number]?.prefix || "."}setreaction 🎉*`

            });

        }

    } catch (error) {

        await client.sendMessage(message.key.remoteJid, {

            text: '❌ Erreur : ' + error.message

        });

    }

}

export async function setwelcome(message, client) {

    const number = client.user.id.split(':')[0];

    const remoteJid = message.key.remoteJid;

    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    const commandAndArgs = messageBody.slice(1).trim();

    const parts = commandAndArgs.split(/\s+/);

    const args = parts.slice(1);

    if (!configmanager.config.users[number]) return;

    const prefix = configmanager.config.users[number]?.prefix || ".";

    try {

        if (args.join(' ').toLowerCase().includes('on')) {

            configmanager.config.users[number].welcome = true;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: "✅ *Welcome activé !*\n\nLes messages de bienvenue sont maintenant actifs."

            });

        } else if (args.join(' ').toLowerCase().includes('off')) {

            configmanager.config.users[number].welcome = false;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: "✅ *Welcome désactivé !*\n\nLes messages de bienvenue sont maintenant désactivés."

            });

        } else {

            const status = configmanager.config.users[number].welcome ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌";

            await client.sendMessage(remoteJid, {

                text: `🔔 *Welcome :* ${status}\n\n📝 Pour activer : *${prefix}setwelcome on*\n📝 Pour désactiver : *${prefix}setwelcome off*`

            });

        }

    } catch (error) {

        console.error('Error changing the welcome:', error);

        await client.sendMessage(remoteJid, {

            text: '❌ Erreur lors du changement du welcome'

        });

    }

}

export async function setautorecord(message, client) {

    const number = client.user.id.split(':')[0];

    const remoteJid = message.key.remoteJid;

    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    const commandAndArgs = messageBody.slice(1).trim();

    const parts = commandAndArgs.split(/\s+/);

    const args = parts.slice(1);

    if (!configmanager.config.users[number]) return;

    const prefix = configmanager.config.users[number]?.prefix || ".";

    try {

        if (args.join(' ').toLowerCase().includes('on')) {

            configmanager.config.users[number].autorecord = true;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: "✅ *Autorecord activé !*"

            });

        } else if (args.join(' ').toLowerCase().includes('off')) {

            configmanager.config.users[number].autorecord = false;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: "✅ *Autorecord désactivé !*"

            });

        } else {

            const status = configmanager.config.users[number].autorecord ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌";

            await client.sendMessage(remoteJid, {

                text: `🎙️ *Autorecord :* ${status}\n\n📝 Pour activer : *${prefix}setautorecord on*\n📝 Pour désactiver : *${prefix}setautorecord off*`

            });

        }

    } catch (error) {

        console.error('Error changing autorecord:', error);

        await client.sendMessage(remoteJid, {

            text: '❌ Erreur lors du changement'

        });

    }

}

export async function setautotype(message, client) {

    const number = client.user.id.split(':')[0];

    const remoteJid = message.key.remoteJid;

    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    const commandAndArgs = messageBody.slice(1).trim();

    const parts = commandAndArgs.split(/\s+/);

    const args = parts.slice(1);

    if (!configmanager.config.users[number]) return;

    const prefix = configmanager.config.users[number]?.prefix || ".";

    try {

        if (args.join(' ').toLowerCase().includes('on')) {

            configmanager.config.users[number].autotype = true;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: "✅ *Autotype activé !*"

            });

        } else if (args.join(' ').toLowerCase().includes('off')) {

            configmanager.config.users[number].autotype = false;

            configmanager.save();

            await client.sendMessage(remoteJid, {

                text: "✅ *Autotype désactivé !*"

            });

        } else {

            const status = configmanager.config.users[number].autotype ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌";

            await client.sendMessage(remoteJid, {

                text: `⌨️ *Autotype :* ${status}\n\n📝 Pour activer : *${prefix}setautotype on*\n📝 Pour désactiver : *${prefix}setautotype off*`

            });

        }

    } catch (error) {

        console.error('Error changing autotype:', error);

        await client.sendMessage(remoteJid, {

            text: '❌ Erreur lors du changement'

        });

    }

}

export async function isPublic(message, client) {

    try {

        const number = client.user.id.split(':')[0];

        const remoteJid = message?.key.remoteJid;

        const ownerNumber = client.user.lid.split(':')[0];

        const prefix = configmanager.config.users[number]?.prefix || ".";

        const messageText = message?.message?.extendedTextMessage?.text || message?.message?.conversation || '';

        if (!configmanager.config.users[number]) return;

        const commandArg = messageText.slice(prefix.length).trim().split(/\s+/)[1]?.toLowerCase();

        const currentPublicMode = configmanager.config.users[number].publicMode || false;

        if (message.key.fromMe || message?.key?.participant === ownerNumber) {

            if (commandArg === 'on') {

                configmanager.config.users[number].publicMode = true;

                configmanager.save();

                await client.sendMessage(remoteJid, {

                    text: "✅ *Mode public activé !*\n\nLe bot peut maintenant être utilisé par tout le monde."

                });

            } else if (commandArg === 'off') {

                configmanager.config.users[number].publicMode = false;

                configmanager.save();

                await client.sendMessage(remoteJid, {

                    text: "✅ *Mode public désactivé !*\n\nSeuls les utilisateurs autorisés peuvent utiliser le bot."

                });

            } else {

                const status = currentPublicMode ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌";

                await client.sendMessage(remoteJid, {

                    text: `🌐 *Mode public :* ${status}\n\n📝 Pour activer : *${prefix}public on*\n📝 Pour désactiver : *${prefix}public off*\n\n⚠️ Seul le propriétaire peut utiliser cette commande.`

                });

            }

        } else {

            await client.sendMessage(remoteJid, {

                text: "⚠️ *Accès refusé !*\n\nSeul le propriétaire du bot peut utiliser cette commande."

            });

        }

    } catch (error) {

        const remoteJid = message?.key.remoteJid;

        await client.sendMessage(remoteJid, {

            text: '❌ Erreur : ' + error.message

        });

        console.log('Error in public mode:', error);

    }

}

export default {

    setreaction,

    setprefix,

    setwelcome,

    setautorecord,

    setautotype,

    isPublic

};
