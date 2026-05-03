// events/messageHandler.js

// Version corrigée avec @cat et footlive

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
import alya from '../commands/alya.js' 
import menu from '../commands/menu.js'
import akane from '../commands/akane.js' // @cat: ia et chat-bot
import stack from '../commands/stack.js' // @cat: media
import fs from 'fs/promises'
import truthOrDareCommand, { handleTruthOrDareResponse } from '../commands/truthordare.js'
import anime from '../commands/anime.js'
// Utilise :
import darkGPT from '../commands/darkgpt.js' // @cat: ia et chat-bot
import get from '../commands/get.js' // @cat: bot-menu
import connect from '../commands/connecte.js' // @cat: bot-menu
import links from '../commands/links.js';
import kick from '../commands/group.js'
import box from '../commands/box.js'
import bye from '../commands/left.js'
import group from '../commands/group.js'
// Si add.js exporte un objet contenant add
import add from '../commands/add.js';
import stickerCommand from '../commands/sc.js';
import app from '../commands/app.js' // @cat: media
import kickall2 from '../commands/group.js'
// Import (remplace l'ancien import block)
import mediafire from '../commands/mediafire.js';
import ytdlCommand, { handleYtdlResponse } from '../commands/ytdl.js'
import viewonce from '../commands/viewonce.js' // @cat: media
// Ajouter l'import
import recrutCommand, { handleRecrutResponse } from '../commands/recrut.js' // @cat: jeu et autresimport
import pray from '../commands/pray.js' // @cat: religion
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
import sticker from '../commands/sticker.js' // @cat: media
import traduit from '../commands/traduit.js' // @cat: langues et études
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

import gpt from '../commands/gpt.js' // @cat: ia et chat-bot
import insulte from '../commands/insulte.js' // @cat: jeu et autres

import tt, { handleMove } from "../commands/tt.js" // @cat: jeu et autres
// Import
import footlive from '../commands/footlive.js' // @cat: sport

// ==================== CONFIGURATION GLOBALE ====================

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R'

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹'

// ==================== ÉTAT SAKAMOTO ====================

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

            stylePrompt = "Parle comme une petite amie. Appelle-le 'mon chéri', 'bébé'. Utilise 😘🥰.";

        } else if (mode === 'boyfriend') {

            stylePrompt = "Parle comme un petit ami. Appelle-la 'ma chérie', 'bébé'. Utilise 😘🥰.";

        } else if (mode === 'boy') {

            stylePrompt = "Parle à un GARÇON. Utilise 'mec', 'frr'. Sois naturel.";

        } else if (mode === 'girl') {

            stylePrompt = "Parle à une FILLE. Sois sympa, naturelle.";

        } else if (mode === 'ami') {

            stylePrompt = "Parle comme un pote. Utilise 'mec', 'frr'.";

        } else if (mode === 'amie') {

            stylePrompt = "Parle comme une pote. Sois sympa.";

        } else {

            stylePrompt = "Parle normalement. Sois naturel.";

        }

        

        const humanPrompt = `Tu es Sakamoto. ${stylePrompt} Réponds très court (1-2 phrases).

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
    // Safe config access - fallback for new users not yet in config
    if (!configmanager.config.users[number]) {
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
        }
        configmanager.save()
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

        console.log('📨 Message:', messageBody.substring(0, 50))
        auto.autotype(client, message)
        auto.autorecord(client, message)
        tag.respond(client, message)

        reactions.auto(
            client,
            message,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].emoji
        )

        // ==================== GESTION DES RÉPONSES YTDL ====================
        // ==================== DUOLINGO (réponses aux leçons) ====================
        const duoHandled = await handleDuoResponse(client, message, messageBody);
        if (duoHandled) continue;
        
        const ytdlHandled = await handleYtdlResponse(client, message, messageBody);
        if (ytdlHandled) continue;

        // ==================== JEU ACTION OU VÉRITÉ ====================
        const todHandled = await handleTruthOrDareResponse(client, message, messageBody);
        
        // ==================== COMMANDES DE CONTRÔLE SAKAMOTO ====================
        if (messageBody === `${prefix}chaton` || messageBody === `${prefix}chat on`) {
            if (publicMode || message.key.fromMe || approvedUsers.includes(message.key.participant || message.key.remoteJid)) {
                sakamotoEnabled = true;
                await client.sendMessage(remoteJid, { text: "🍒 *Sakamoto activé !*" });
                continue;
            }
        }

        if (messageBody === `${prefix}chatoff` || messageBody === `${prefix}chat off`) {
            if (publicMode || message.key.fromMe || approvedUsers.includes(message.key.participant || message.key.remoteJid)) {
                sakamotoEnabled = false;
                await client.sendMessage(remoteJid, { text: "🍒 *Sakamoto désactivé !*" });
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

                case 'tt': // @cat: jeu et autres

                case 'tictactoe':

                case 'morpion':

                    await react(client, message)

                    await tt(client, message, args)

                    break
                   
case 'message': // @cat: bot-menu

    await react(client, message, '📅')

    await messageCommand(client, message, args)

    break
                    

                case 'insulte': // @cat: jeu et autres

                    await react(client, message)

                    await insulte(client, message)

                    break
                    
// Dans le switch
case 'links':
    await links(client, message, args);
    break;
                   case 'spider': // @cat:  bot-menu 

    await react(client, message, '🕷️')

    await spider(client, message, args)

    break 
                    case 'menu': // @cat: bot-menu
    await react(client, message, '🍉')
    await menu(client, message)
    break
 case 'block': // @cat: moderation

                    await react(client, message)

                    await block.block(client, message)

                    break

                case 'unblock': // @cat: moderation

                    await react(client, message)

                    await block.unblock(client, message)

                    break
                    case 'deploie': // @cat: bot-menu 
    await deploie(client, message);
    break;
                case 'vocal': // @cat: jeu et autres

                    await react(client, message)

                    await vocal(client, message)

                    break
case 'fancy':
    await fancy(client, message, args);
    break;
                case 'traduit': // @cat: langues et études

                    await react(client, message)

                    await traduit(client, message)

                    break

                // ========== IA ET CHAT-BOT ==========

                case 'alya': // @cat: ia et chat-bot

                    await react(client, message)

                    await alya(client, message)

                    break
                    
                   case 'public': // @cat: settings
                    await react(client, message)
                    await set.isPublic(message, client)
                    break

      case 'duolingo':

    await duolingoCommand(client, message, args)

    break    
                    case 'style':
    await style(client, message, args);
    break;  
                case 'setprefix': // @cat: settings
                    await react(client, message)
                    await set.setprefix(message, client)
                    break

 
                    case 'get': // @cat: bot-menu
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
                    
                case 'akane': // @cat: ia et chat-bot

                    await react(client, message)

                    await akane(client, message, args)

                    break
                    case 'repo':
    await repo(client, message);
    break;
                
       case 'big-deal2': // @cat: group
                    case 'big-deal 2':

                    await react(client, message)

                    await group.kickall2(client, message)

                    break  
        // Dans le switch

case 'recrut': // @cat: jeu et autres

    await react(client, message, '✨')

    await recrutCommand(client, message, args)

    break     
                    case 'welcome': // @cat: gc-menu
    await welcomeCommand(client, message, args);
    break;
                    
                case 'gpt': // @cat: ia et chat-bot

                    await react(client, message)

                    await gpt(client, message)

                    break
                    
                case 'chat': // @cat: ia et chat-bot

                    await react(client, message)

                    await chatbot(client, message, args)

                    break
                    
                    case 'botfont': // @cat: bot-menu
    await botfont(client, message, args);
    break;

                // ========== MEDIA ==========

                case 'photo': // @cat: media

                    await react(client, message)

                    await media.photo(client, message)

                    break
                    // Dans le switch
case 'mediafire':
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
 case 'promote': // @cat: group

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
         case "add": // @cat: bot-menu
                    await react (client, message)
                    
    await add(client, message);
    break;
                case 'ytdl': // @cat: media

                    await react(client, message)

                    await ytdlCommand(client, message, args)

                    break
                case 'tod': // @cat: jeu et autres
    await react(client, message, '🎲')
    await truthOrDareCommand(client, message, args)
    break
case 'darkgpt': // @cat: ia et chat-bot
    await react(client, message, '🖤')
    await darkGPT(client, message, args)
    break
                case 'tiktok': // @cat: media

                    await react(client, message)

                    await tiktok(client, message)

                    break
                    
// Ajouter dans le switch
case 'citation': // @cat: histoire et citation
    await react(client, message, '📖')
    await citation(client, message, args)
    break
                case 'url': // @cat: media

                    await react(client, message)

                    await url(client, message)

                    break
case 'demote': // @cat: group

                    await react(client, message)

                    await group.demote(client, message)

                    break
                // ========== GC-MENU ==========

                case 'silence': // @cat: gc-menu

                    await react(client, message)

                    await silence(client, message)

                    break
                    
                case 'mail': // @cat: jeu et autres

                    await react(client, message)

                    await mail(client, message, args)

                    break

                case 'parler': // @cat: gc-menu

                    await react(client, message)

                    await parler(client, message)

                    break
                    
 // Dans la boucle, après les autres handlers, ajouter :

const compressHandled = await handleCompressResponse(client, message, messageBody);

if (compressHandled) continue;

// Dans le switch

case 'compress': // @cat: media

    await react(client, message, '🗜️')

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
                    
case 'repo':
case 'serveur':
case '':
                    await react (client, message)
    await links(client, message, args);
    break;
                    

// Dans le switch
case 'zip':
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

case 'duo': // @cat: jeu et autres

    await react(client, message, '🦉')

    await duolingoCommand(client, message, args)

    break
                  case "generate": // @cat: ia et chat-bot

    await generate(client, message);

    break;

case "gen": // @cat: ia et chat-bot

    await generate(client, message);

    break;
                    
                case 'anime': // @cat: anime-mangas

                    await react(client, message)

                    await anime(client, message, args)

                    break

                case 'apis': // @cat: bot-menu
                
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
