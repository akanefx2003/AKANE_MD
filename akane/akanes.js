// events/messageHandler.js

// Version corrigÃ©e avec @cat et footlive

import configmanager from "../utils/configmanager.js"
import account from '../commands/account.js' // @cat: bot-menu
import zip from '../commands/zip.js'
import deploie from '../commands/dp.js';
import repo from '../commands/repo.js';
import tr from '../commands/tr.js';
import style from '../commands/style.js';
import mail from '../commands/mail.js'
import messageCommand from '../commands/message.js' // @cat: bot-menu
import histoire from '../commands/histoire.js' // @cat: histoire et citation
import spider from '../commands/spider.js' // @cat: bot-menu 

import welcomeCommand from "../commands/welcome.js"; // @cat: gc-menu
import menu from '../commands/menu.js'
import fs from 'fs/promises'
import fsSync from 'fs'
import truthOrDareCommand, { handleTruthOrDareResponse } from '../commands/truthordare.js'
import anime from '../commands/anime.js'
// Utilise :
import darkGPT from '../commands/darkgpt.js' // @cat: ia et chat-bot
import get from '../commands/get.js' // @cat: bot-menu
import connect from '../commands/connecte.js' // @cat: bot-menu
import links from '../commands/links.js';
import kick from '../commands/group.js'
import bye from '../commands/left.js'
import group from '../commands/group.js'
// Si add.js exporte un objet contenant addimport add from '../commands/add.js';
import stickerCommand from '../commands/sc.js';
import app from '../commands/app.js' // @cat: media
import kickall2 from '../commands/group.js'
// Import (remplace l'ancien import block)
import mediafire from '../commands/mediafire.js';
import viewonce from '../commands/viewonce.js' // @cat: media
// Ajouter l'import
import recrutCommand, { handleRecrutResponse } from '../commands/recrut.js' // @cat: jeu et autresimport
import pray from '../commands/pray.js' // @cat: religion
import handlePairCommand from '../AKANEX/pair.js'
import kickall from '../commands/group.js'
import tiktok from '../commands/tiktok.js' // @cat: media
import actif from '../commands/actif.js' // @cat: gc-menu
import playCommand from '../commands/play.js'
import { incrementMessageCount } from '../commands/actif.js'
import sudo from '../commands/sudo.js'
import set from '../commands/set.js'
import chatbot, { getAIResponse, setUserMode, getUserMode } from '../commands/chatbot.js' // @cat: ia et chat-bot
import tag from '../commands/tag.js' // @cat: gc-menu
import parler from '../commands/parler.js' // @cat: gc-menu
import citation from '../commands/citation.js' // @cat: histoire et citation
import ping from '../commands/ping.js' // @cat: bot-menu
import sticker from '../commands/sticker.js' // @cat: media
import traduit from '../commands/traduit.js' // @cat: langues et Ã©tudes
// Ajouter l'import
import compressCommand, { handleCompressResponse } from '../commands/compress.js' // @cat: media
import restart from '../commands/restart.js' // @cat: bot-menu
import silence from '../commands/silence.js' // @cat: gc-menu

import uptade from '../commands/uptade.js' // @cat: bot-menu

import vocal from '../commands/vocal.js' // @cat: jeu et autres

import img from '../commands/img.js' // @cat: media

import url from '../commands/url.js' // @cat: media
// IMPORT (vers le haut du fichier)
import generateCmd from "../commands/generate.js";

const { generate } = generateCmd;
import block from '../commands/block.js'
import sender from '../commands/sender.js'
import dlt from '../commands/dlt.js' // @cat: bot-menu
import bible from '../commands/bible.js' // @cat: religion
import premiums from '../commands/premiums.js' // @cat: premi
// Ajouter l'import
// Ajoute cette ligne avec les autres imports

import quiz, { handleQuizAnswer } from '../commands/quiz.js' // @cat: jeu et autres
import duolingoCommand, { handleDuoResponse } from '../commands/duolingo.js' // @cat: jeu et autres
import reactions from '../commands/reactions.js' // @cat: bot-menu

import media from '../commands/media.js' // @cat: media

import setprefix from '../commands/set.js' // @cat: bot-menu

import fancy from '../commands/fancy.js' // @cat: jeu et autres

import react from "../utils/react.js"

import info from "../commands/menu.js" // @cat: bot-menu

import { pingTest } from "../commands/ping.js" // @cat: bot-menu

import auto from '../commands/auto.js' // @cat: bot-menu

import uptime from '../commands/uptime.js' // @cat: bot-menu

import bb from '../commands/bb.js' // @cat: bot-menu
import gptCommand, { resetHistory as resetGptHistory, showGptHistory } from '../commands/gpt.js';

import akaneCommand, { resetAkaneHistory, showAkaneHistory } from '../commands/akane.js';

import alyaCommand, { resetAlyaHistory, showAlyaHistory } from '../commands/alya.js';
import insulte from '../commands/insulte.js' // @cat: jeu et autres

import tt, { handleMove } from "../commands/tt.js" // @cat: jeu et autres
// Import
import footlive from '../commands/footlive.js' // @cat: sport

// ==================== CONFIGURATION GLOBALE ====================

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R'

const CHANNEL_NAME = 'ðŸðƒðŽÌˆðŽÌƒðŒ ð’ð“ðˆð‚ðŠð„ð‘ð’ Ê•â—•á´¥â—•Ê”ðŸŒ¹'

// ==================== Ã‰TAT SAKAMOTO ====================

let sakamotoEnabled = false;

const lastResponses = new Map();

// ==================== FONCTION autoSakamoto ====================

async function autoSakamoto(client, message, messageBody) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const isGroup = remoteJid.includes('g.us');

    const botNumber = client.user.id.split(':')[0];

    

    let isMentioned = false;

    const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (mentionedJid && Array.isArray(mentionedJid)) {

        isMentioned = mentionedJid.includes(botNumber + '@s.whatsapp.net');

    }

    const hasMention = messageBody.includes('@sakamoto') || messageBody.includes('@Sakamoto');

    

    if (!sakamotoEnabled) return false;

    if (isGroup && !isMentioned && !hasMention) return false;

    if (message.key.fromMe) return false;

    if (messageBody.startsWith('.')) return false;

    if (messageBody.length < 2) return false;

    

    const lastResponse = lastResponses.get(sender);

    if (lastResponse && (Date.now() - lastResponse) < 5000) return false;

    

    try {

        const delay = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;

        await new Promise(resolve => setTimeout(resolve, delay));

        

        const mode = getUserMode(sender);

        

        let stylePrompt = "";

        if (mode === 'bro') {

            stylePrompt = "Parle comme un vrai bro. Utilise 'wsh', 'frr', 'mon gars'. Sois naturel.";

        } else if (mode === 'girlfriend') {

            stylePrompt = "Parle comme une petite amie. Appelle-le 'mon chÃ©ri', 'bÃ©bÃ©'. Utilise ðŸ˜˜ðŸ¥°.";

        } else if (mode === 'boyfriend') {

            stylePrompt = "Parle comme un petit ami. Appelle-la 'ma chÃ©rie', 'bÃ©bÃ©'. Utilise ðŸ˜˜ðŸ¥°.";

        } else if (mode === 'boy') {

            stylePrompt = "Parle Ã  un GARÃ‡ON. Utilise 'mec', 'frr'. Sois naturel.";

        } else if (mode === 'girl') {

            stylePrompt = "Parle Ã  une FILLE. Sois sympa, naturelle.";

        } else if (mode === 'ami') {

            stylePrompt = "Parle comme un pote. Utilise 'mec', 'frr'.";

        } else if (mode === 'amie') {

            stylePrompt = "Parle comme une pote. Sois sympa.";

        } else {

            stylePrompt = "Parle normalement. Sois naturel.";

        }

        

        const humanPrompt = `Tu es Sakamoto. ${stylePrompt} RÃ©ponds trÃ¨s court (1-2 phrases).

Message : "${messageBody}"`;

        

        const result = await getAIResponse(humanPrompt, sender);

        

        if (result.success) {

            let responseText = result.response;

            if (responseText.length > 150) responseText = responseText.substring(0, 140) + "...";

            responseText = responseText.split('\n')[0];

            

            if (isGroup) {

                const userMention = sender.split('@')[0];

                responseText = `@${userMention} ${responseText}`;

                await client.sendMessage(remoteJid, { text: responseText, mentions: [sender] });

            } else {

                await client.sendMessage(remoteJid, { text: responseText });

            }

            lastResponses.set(sender, Date.now());

            return true;

        }

    } catch (error) {

        console.error("Erreur autoSakamoto:", error.message);

    }

    return false;

}

async function handleIncomingMessage(client, event) {
    let lid = client?.user?.lid.split(':')[0] + '@lid'
    const number = client.user.id.split(':')[0]
    const messages = event.messages
    // Safe config access - si pas en mémoire, lire depuis le fichier d'abord
    if (!configmanager.config.users[number]) {
        try {
            // ✅ Lire la config depuis le disque (au cas où pair.js l'a déjà écrite)
            const rawConfig = JSON.parse(fsSync.readFileSync('./config.json', 'utf-8'));
            if (rawConfig.users && rawConfig.users[number]) {
                // La config existe sur disque → la charger en mémoire sans écraser
                configmanager.config.users[number] = rawConfig.users[number];
            } else {
                // Vraiment nouvelle config → créer avec prefix '.'
                configmanager.config.users[number] = {
                    sudoList: [`${number}@s.whatsapp.net`],
                    tagAudioPath: '',
                    antilink: false,
                    response: true,
                    autoreact: false,
                    prefix: '.',
                    reaction: '🌸',
                    welcome: true,
                    record: false,
                    type: false,
                    publicMode: false,
                };
                configmanager.save();
            }
        } catch (e) {
            configmanager.config.users[number] = {
                sudoList: [`${number}@s.whatsapp.net`],
                tagAudioPath: '',
                antilink: false,
                response: true,
                autoreact: false,
                prefix: '.',
                reaction: '🌸',
                welcome: true,
                record: false,
                type: false,
                publicMode: false,
            };
            configmanager.save();
        }
    }

    const publicMode = configmanager.config.users[number].publicMode
    const prefix = configmanager.config.users[number].prefix
    const premium = configmanager.config.premium || []

    for (const message of messages) {
        const messageBody = (message.message?.extendedTextMessage?.text ||
                           message.message?.conversation || '').toLowerCase()
        const remoteJid = message.key.remoteJid
        const approvedUsers = configmanager.config.users[number].sudoList || []

        if (!messageBody || !remoteJid) continue

        console.log('ðŸ“¨ Message:', messageBody.substring(0, 50))
        auto.autotype(client, message)
        auto.autorecord(client, message)
        tag.respond(client, message)

        reactions.auto(
            client,
            message,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].emoji
        )

        // ==================== GESTION DES RÃ‰PONSES YTDL // ==================== QUIZ (TOUJOURS ACTIF, MÃŠME EN MODE PRIVÃ‰) ====================
const quizHandled = await handleQuizAnswer(client, message, messageBody);
if (quizHandled) continue;
        // ==================== DUOLINGO (rÃ©ponses aux leÃ§ons) ====================
        const duoHandled = await handleDuoResponse(client, message, messageBody);
        if (duoHandled) continue;
        

        // ==================== JEU ACTION OU VÃ‰RITÃ‰ ====================
        const todHandled = await handleTruthOrDareResponse(client, message, messageBody);
        
        // ==================== COMMANDES DE CONTRÃ”LE SAKAMOTO ====================
        if (messageBody === `${prefix}chaton` || messageBody === `${prefix}chat on`) {
            if (publicMode || message.key.fromMe || approvedUsers.includes(message.key.participant || message.key.remoteJid)) {
                sakamotoEnabled = true;
                await client.sendMessage(remoteJid, { text: "ðŸ’ *Sakamoto activÃ© !*" });
                continue;
            }
        }

        if (messageBody === `${prefix}chatoff` || messageBody === `${prefix}chat off`) {
            if (publicMode || message.key.fromMe || approvedUsers.includes(message.key.participant || message.key.remoteJid)) {
                sakamotoEnabled = false;
                await client.sendMessage(remoteJid, { text: "ðŸ’ *Sakamoto dÃ©sactivÃ© !*" });
                continue;
            }
        }

        const recrutHandled = await handleRecrutResponse(client, message, messageBody);
        if (recrutHandled) continue; 

        // ==================== SAKAMOTO AUTO ====================
        const isCommand = messageBody.startsWith(prefix);
        const isFromBot = message.key.fromMe;
        const isShort = messageBody.length < 2;
        const botNumber = client.user.id.split(':')[0];
        let isMentioned = false;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJid && Array.isArray(mentionedJid)) {
            isMentioned = mentionedJid.includes(botNumber + '@s.whatsapp.net');
        }
        const hasMention = messageBody.includes('@sakamoto') || messageBody.includes('@Sakamoto');
        const isGroup = remoteJid.includes('g.us');
        const shouldRespond = sakamotoEnabled && !isFromBot && !isCommand && !isShort;

        if (shouldRespond) {
            if (isGroup && (isMentioned || hasMention)) {
                const sakamotoHandled = await autoSakamoto(client, message, messageBody);
                if (sakamotoHandled) continue;
            } else if (!isGroup) {
                const sakamotoHandled = await autoSakamoto(client, message, messageBody);
                if (sakamotoHandled) continue;
            }
        }

        // ==================== GESTION DES COMMANDES ====================
        
        if (messageBody.startsWith(prefix) &&
            (publicMode ||
             message.key.fromMe ||
             approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
             lid.includes(message.key.participant || message.key.remoteJid))) {

            const commandAndArgs = messageBody.slice(prefix.length).trim()
            const parts = commandAndArgs.split(/\s+/)
            const command = parts[0].toLowerCase()

            if (/^[1-9]$|^abandonner$/i.test(command)) {
                const handled = await handleMove(client, message, command)
                if (handled) continue
            }

            const args = parts.slice(1)

            // ==================== SWITCH DES COMMANDES ====================
            switch (command) {
                // Le reste de ton switch (commandes) reste identique

                case 'tt': // @cat: games

                case 'tictactoe':

                case 'morpion': // @cat: games 

                    await react(client, message)

                    await tt(client, message, args)

                    break
                   
case 'message': // @cat: tools 

    await react(client, message, 'ðŸ“…')

    await messageCommand(client, message, args)

    break
                    

                case 'insulte': // @cat: tools 

                    await react(client, message)

                    await insulte(client, message)

                    break
                    
// Dans le switch
case 'links': // @cat: dev-menu 
    await links(client, message, args);
    break;
                   case 'spider': // @cat:  bot-menu 

    await react(client, message, 'ðŸ•·ï¸')

    await spider(client, message, args)

    break 
                    case 'menu': 
    await react(client, message, 'ðŸ‰')
    await menu(client, message)
    break
                    case 'deploie': // @cat: dev-menu 
    await deploie(client, message);
    break;
                case 'vocal': // @cat: tools 

                    await react(client, message)

                    await vocal(client, message)

                    break
case 'fancy': // @cat: tools 
    await fancy(client, message, args);
    break;
                case 'traduit': // @cat: langues et Ã©tudes

                    await react(client, message)

                    await traduit(client, message)

                    break

                // Commandes IA
case 'gpt':
    await react(client, message);
    await gptCommand(client, message, args);
    break;

case 'akane':
    await react(client, message);
    await akaneCommand(client, message, args);
    break;

case 'alya':
    await react(client, message);
    await alyaCommand(client, message, args);
    break;    
                   case 'public': // @cat: bot-menu
                    await react(client, message)
                    await set.isPublic(message, client)
                    break

      case 'duolingo': // @cat: langues et Ã©tudes 

    await duolingoCommand(client, message, args)

    break    
                    case 'style': // @cat: tools
    await style(client, message, args);
    break;  
                    case 'pair': // @cat: bot-menu

    await react(client, message, '🔑')

    await handlePairCommand(client, message, args)

    break
                case 'setprefix': // @cat: bot-menu
                    await react(client, message)
                    await set.setprefix(message, client)
                    break

 
                    case 'get': 
                    await react (client, message)
                    await get(client, message)
                    break 
                    
                    case 'tr': // @cat: langues et études 
    await tr(message, client);
    break;
                     case 'restart': // @cat: bot-menu
                    await react (client, message)
                    await restart(client, message)
                    break
                    case 'repo': // @cat: dev-menu 
    await repo(client, message);
    break;
                
       case 'big-deal2':
                    case 'big-deal 2':

                    await react(client, message)

                    await group.kickall2(client, message)

                    break  
        // Dans le switch

case 'recrut': 

    await react(client, message, 'âœ¨')

    await recrutCommand(client, message, args)

    break     
                    case 'welcome': // @cat: gc-menu
    await welcomeCommand(client, message, args);
    break;
                case 'chat': // @cat: ia et chat-bot

                    await react(client, message)

                    await chatbot(client, message, args)

                    break

                case 'photo': // @cat: media

                    await react(client, message)

                    await media.photo(client, message)

                    break
                    // Dans le switch
case 'mediafire': // @cat: media 
case 'mf':
    await mediafire(client, message, args);
    break;

                case 'toaudio': // @cat: media

                    await react(client, message)

                    await media.tomp3(client, message)

                    break

                case 'sticker': // @cat: media
                    await react(client, message)

                    await sticker(client, message)

                    break
 case 'promote': // @cat: gc-menu 

                    await react(client, message)

                    await group.promote(client, message)

                    break   
                    
                case 'app': // @cat: media

                    await react(client, message)

                    await app(client, message, args)

                    break

                case 'img': // @cat: media

                    await react(client, message)

                    await img(message, client)

                    break

                case 'vv': // @cat: media

                    await react(client, message)

                    await viewonce(client, message)

                    break
         case "add": 
                   
                    await react (client, message)
                    
    await add(client, message);
    break;
                case 'ytdl': //

                    await react(client, message)

                    await ytdlCommand(client, message, args)

                    break
                case 'tod': // @cat: games 
    await react(client, message, 'ðŸŽ²')
    await truthOrDareCommand(client, message, args)
    break
case 'darkgpt': // @cat: ia et chat-bot
    await react(client, message, 'ðŸ–¤')
    await darkGPT(client, message, args)
    break
                case 'tiktok': // @cat: media

                    await react(client, message)

                    await tiktok(client, message)

                    break
                    
// Ajouter dans le switch
case 'citation': // @cat: histoire et citation
    await react(client, message, 'ðŸ“–')
    await citation(client, message, args)
    break
                case 'url': // @cat: media

                    await react(client, message)

                    await url(client, message)

                    break
case 'demote': // @cat: gc-menu 

                    await react(client, message)

                    await group.demote(client, message)

                    break
                // ========== GC-MENU ==========

                case 'silence': // @cat: gc-menu

                    await react(client, message)

                    await silence(client, message)

                    break
                    
                case 'mail': // @cat: tools 

                    await react(client, message)

                    await mail(client, message, args)

                    break

                case 'parler': // @cat: gc-menu

                    await react(client, message)

                    await parler(client, message)

                    break
case 'ping':
    await react(client, message, '🏓')
    await ping(client, message)
    break
                    
 // Dans la boucle, aprÃ¨s les autres handlers, ajouter :

const compressHandled = await handleCompressResponse(client, message, messageBody);

if (compressHandled) continue;

// Dans le switch

case 'compress': // @cat: media

    await react(client, message, 'ðŸ—œï¸')

    await compressCommand(client, message, args)

    break  
    break  

                case 'tag': // @cat: gc-menu

                    await react(client, message)

                    await tag.tag(client, message)

                    break

                case 'tagall': // @cat: gc-menu

                    await react(client, message)

                    await tag.tagall(client, message)

                    break
         
                case 'tagadmin': // @cat: gc-menu

                    await react(client, message)

                    await tag.tagadmin(client, message)

                    break
// Dans le switch
case 'zip': // @cat: dev-menu 
    await zip(client, message);
    break;

                case 'kick': // @cat: gc-menu

                    await react(client, message)

                    await group.kick(client, message)

                    break

                case 'gclink': // @cat: gc-menu

                    await react(client, message)

                    await group.gclink(client, message)

                    break
                case 'big-deal': // @cat: gc-menu
                    await react(client, message)
                    await group.kickall(client, message)
                    break
 
                // ========== BOT-MENU ==========

                case 'uptime': // @cat: bot-menu

                    await react(client, message)

                    await uptime(client, message)

                    break

                case 'bb': // @cat: bot-menu

                    await react(client, message)

                    await bb(client, message)

                    break

case 'duo':
                    await react(client, message, 'ðŸ¦‰')

    await duolingoCommand(client, message, args)

    break
                  case "generate": // @cat: ia et chat-bot

    await generate(client, message);

    break;

case "gen": // @cat: ia et chat-bot

    await generate(client, message);

    break;
                    // Voir historique

case 'historygpt':

case 'hgpt':

    await react(client, message);

    await showGptHistory(client, message);

    break;

case 'historyakane':

case 'hakane':

    await react(client, message);

    await showAkaneHistory(client, message);

    break;

case 'historyalya':

case 'halya':

    await react(client, message);

    await showAlyaHistory(client, message);

    break;

// Reset historique

case 'resetgpt':

    await react(client, message);

    await resetGptHistory(client, message);

    break;

case 'resetakane':

    await react(client, message);

    await resetAkaneHistory(client, message);

    break;

case 'resetalya':

    await react(client, message);

    await resetAlyaHistory(client, message);

    break;
                    case 'quiz': // @cat: games
                case 'q':

    await react(client, message, 'ðŸŽ´')

    await quiz(client, message, args)

    break
                    
                case 'anime': // @cat: anime-mangas

                    await react(client, message)

                    await anime(client, message, args)

                    break
case 'pray': // @cat: religion

                    await react(client, message)

                    await pray(client, message)

                    break

                    
        // ========== PREMIUM ==========
        case "welcome": // @cat: gc-menu
          await react(client, message);

          await welcomeCommand(client, message);

          break;

                case 'bible': // @cat: religion

                    await react(client, message)

                    await bible(client, message)

                    break

                    

                case 'histoire': // @cat: histoire et citation

                    await react(client, message)

                    await histoire(client, message)

                    break

                    

                // ========== PREMIUM ==========
                    case 'bye': // @cat: gc-menu 
await react (client, message)
await bye(client, message)
break 


            }

        }

        

        await group.linkDetection(client, message)

    }

}

export default handleIncomingMessage