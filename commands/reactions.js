import configmanager from '../utils/configmanager.js';

export async function auto(client, message, cond, emoji){

    // Correction de l'erreur de syntaxe

    const remoteJid = message.key.remoteJid;  // ✅ Ajout du "="

    if(cond){

        await client.sendMessage(remoteJid, {

            react: {

                text: `${emoji}`,

                key: message.key

            }

        });

    } else {

        return;

    }

}

// Simple emoji regex (works for most cases)

function isEmoji(str) {

    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;

    return emojiRegex.test(str);

}

export async function autoreact(client, message) {

    const number = client.user.id.split(':')[0];

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) {

            throw new Error("Message JID is undefined.");

        }

        const messageBody =

            message.message?.extendedTextMessage?.text ||

            message.message?.conversation ||

            '';

        const commandAndArgs = messageBody.slice(1).trim();

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        if (args.length === 0) {

            throw new Error("Please provide 'on', 'off'.");

        }

        const input = args[0].toLowerCase();

        if (!configmanager.config.users[number]) {

            configmanager.config.users[number] = {};

        }

        const userConfig = configmanager.config.users[number];

        if (input === 'on') {

            userConfig.autoreact = true;

            configmanager.save();

            

            // Remplacer bug() par client.sendMessage()

            await client.sendMessage(remoteJid, {

                text: `✅ L'Auto-react est activé *${input.toUpperCase()}*.`

            });

        

        } else if (input === "off") {

            userConfig.autoreact = false;

            configmanager.save();

            

            // Remplacer bug() par client.sendMessage()

            await client.sendMessage(remoteJid, {

                text: `❌ L'Auto-react est désactivé *${input.toUpperCase()}*.`

            });

        } else {

            await client.sendMessage(remoteJid, { 

                text: "_*Select an option: On/off*_" 

            });

        }

    } catch (error) {

        await client.sendMessage(message.key.remoteJid, {

            text: `❌ Error while updating autoreact settings: ${error.message}`,

        });

    }

}

export default { auto, autoreact };
