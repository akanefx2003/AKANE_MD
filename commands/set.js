import configmanager from '../utils/configmanager.js';

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

            configmanager.config.users[number].prefix = newPrefix;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Prefix changed successfully"

            });

        } else {

            if (args.length === 0) {

                const emptyPrefix = '';

                if (!configmanager.config.users[number]) configmanager.config.users[number] = {};

                configmanager.config.users[number].prefix = emptyPrefix;

                configmanager.save();

                

                await client.sendMessage(remoteJid, {

                    text: "✅ Prefix changed successfully"

                });

            } else {

                await client.sendMessage(remoteJid, {

                    text: "⚠️ Prefix was not changed successfully"

                });

                throw new Error("Specify the prefix.");

            }

        }

    } catch (error) {

        await client.sendMessage(message.key.remoteJid, {

            text: '❌ An error occurred while trying to modify the prefix: ' + error.message

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

            configmanager.config.users[number].emoji = reactionEmoji;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Reaction changed successfully"

            });

        } else {

            await client.sendMessage(remoteJid, {

                text: "⚠️ Reaction was not changed successfully. Please provide a valid emoji."

            });

            throw new Error("Specify the emoji.");

        }

    } catch (error) {

        await client.sendMessage(message.key.remoteJid, {

            text: '❌ An error occurred while trying to modify the reaction emoji: ' + error.message

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

    

    try {

        if (args.join(' ').toLowerCase().includes('on')) {

            configmanager.config.users[number].welcome = true;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Welcome has been turned ON"

            });

        } else if (args.join(' ').toLowerCase().includes('off')) {

            configmanager.config.users[number].welcome = false;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Welcome has been turned OFF"

            });

        } else {

            await client.sendMessage(remoteJid, {

                text: "⚠️ Select an option: on / off"

            });

        }

    } catch (error) {

        console.error('Error changing the welcome:', error);

        await client.sendMessage(remoteJid, {

            text: '❌ Error changing welcome setting'

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

    

    try {

        if (args.join(' ').toLowerCase().includes('on')) {

            configmanager.config.users[number].autorecord = true;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Autorecord has been turned ON"

            });

        } else if (args.join(' ').toLowerCase().includes('off')) {

            configmanager.config.users[number].autorecord = false;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Autorecord has been turned OFF"

            });

        } else {

            await client.sendMessage(remoteJid, {

                text: "⚠️ Select an option: on / off"

            });

        }

    } catch (error) {

        console.error('Error changing autorecord:', error);

        await client.sendMessage(remoteJid, {

            text: '❌ Error changing autorecord setting'

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

    

    try {

        if (args.join(' ').toLowerCase().includes('on')) {

            configmanager.config.users[number].autotype = true;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Autotype has been turned ON"

            });

        } else if (args.join(' ').toLowerCase().includes('off')) {

            configmanager.config.users[number].autotype = false;

            configmanager.save();

            

            await client.sendMessage(remoteJid, {

                text: "✅ Autotype has been turned OFF"

            });

        } else {

            await client.sendMessage(remoteJid, {

                text: "⚠️ Select an option: on / off"

            });

        }

    } catch (error) {

        console.error('Error changing autotype:', error);

        await client.sendMessage(remoteJid, {

            text: '❌ Error changing autotype setting'

        });

    }

}

export async function isPublic(message, client) {

    try {

        const number = client.user.id.split(':')[0];

        const remoteJid = message?.key.remoteJid;

        const ownerNumber = client.user.lid.split(':')[0];

        const prefix = configmanager.config.users[number].prefix;

        const messageText = message?.message?.extendedTextMessage?.text || message?.message?.conversation || '';

        

        if (!configmanager.config.users[number]) return;

        

        const commandArg = messageText.slice(prefix.length).trim().split(/\s+/)[1]?.toLowerCase();

        const currentPublicMode = configmanager.config.users[number].publicMode || false;

        

        if (message.key.fromMe || message?.key?.participant === ownerNumber) {

            if (commandArg === 'on') {

                configmanager.config.users[number].publicMode = true;

                configmanager.save();

                await client.sendMessage(remoteJid, {

                    text: "✅ Mode public activé"

                });

            } else if (commandArg === 'off') {

                configmanager.config.users[number].publicMode = false;

                configmanager.save();

                await client.sendMessage(remoteJid, {

                    text: "🚫 Mode public désactivé"

                });

            } else {

                await client.sendMessage(remoteJid, {

                    text: "⚠️ Please set on or off to set the bot mode."

                });

            }

        } else {

            await client.sendMessage(remoteJid, {

                text: "⚠️ Only my owner can use this command"

            });

        }

    } catch (error) {

        const remoteJid = message?.key.remoteJid;

        await client.sendMessage(remoteJid, {

            text: '❌ Error in bot mode set: ' + error.message

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