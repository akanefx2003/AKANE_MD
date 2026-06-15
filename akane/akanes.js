// events/messageHandler.js

// Version corrigée avec @cat et footlive

import configmanager from "../utils/configmanager.js"
import { isTrusted, getTrustedJids } from '../AKANEX/trusted.js'
import { sudoCommand, desudoCommand, sudoListCommand } from '../AKANEX/sudo.js' // @cat: bot-menu
import tt, { handleMove } from '../commands/tt.js' // @cat: games
import { tagallCommand, tagadminCommand, tagmembersCommand, hidetagCommand, antitagCommand } from '../commands/tag.js'
import kickCommand from '../commands/kick.js'
import approveCommand from '../commands/approve.js'
import ginfoCommand from '../commands/ginfo.js'
import { promoteCommand, demoteCommand } from '../commands/admin.js'
import setgnameCommand from '../commands/setgname.js'
import setgdescCommand from '../commands/setgdesc.js'
import gstatusCommand from '../commands/gstatus.js'
import setgppCommand from '../commands/setgpp.js'
import groupCreateCommand from '../commands/groupcreate.js'
import soraCommand from '../commands/sora.js'
import invite from '../commands/invite.js' // @cat: gc-menu
//import tempCommand from '../commands/temp.js';
import echoCommand from '../commands/echo.js'
//import pinCommand, { unpinCommand } from '../commands/pin.js';
import stickerPackCommand, { handleStickerPackResponse } from '../commands/stickerpack.js';
import handlePairCommand, { handleUnpairCommand, handlePairListCommand, handleReferralCommand } from '../AKANEX/pair.js'
import zip from '../commands/zip.js'
import wss from '../commands/wss.js' // @cat: tools
import deploie from '../commands/dp.js';
import repo from '../commands/repo.js';
import tr from '../commands/tr.js';
import style from '../commands/style.js';
import mail from '../commands/mail.js'
import messageCommand from '../commands/message.js' // @cat: bot-menu
import take from  '../commands/take.js'
import tgsticker from '../commands/tg.js' // @cat: media
import histoire from '../commands/histoire.js' // @cat: histoire et citation
import demoteall from '../commands/demoteall.js'
import spider from '../commands/spider.js' // @cat: bot-menu 
import welcomeCommand from "../commands/welcome.js"; // @cat: gc-menu
import info, { setMenuCommand } from '../commands/menu.js';
import menu from '../commands/menu.js'
import fs from 'fs/promises'
import fsSync from 'fs'
import truthOrDareCommand, { handleTruthOrDareResponse } from '../commands/truthordare.js'
import anime from '../commands/anime.js'
// Utilise :
import darkgpt from '../commands/darkgpt.js'
import antilinkCommand, { handleAntilink } from '../commands/antilink.js' // @cat: gc-menu
import get from '../commands/get.js' // @cat: bot-menu
import links from '../commands/links.js';
import kick from '../commands/group.js'
import bye from '../commands/left.js'
import group from '../commands/group.js'
import stickerCommand from '../commands/sc.js';
import app from '../commands/app.js' // @cat: media
import kickall2 from '../commands/group.js'
import mediafire from '../commands/mediafire.js';
import song from '../commands/song.js' // @cat: media
import viewonce from '../commands/viewonce.js' // @cat: media
import recrutCommand, { handleRecrutResponse } from '../commands/recrut.js' // @cat: jeu et autres
import pray from '../commands/pray.js' // @cat: religion
//import handlePairCommand from '../AKANEX/pair.js'
import kickall from '../commands/group.js'
import tiktok from '../commands/tiktok.js' // @cat: media
import parler from '../commands/parler.js' // @cat: gc-menu
import citation from '../commands/citation.js' // @cat: histoire et citation
import sticker from '../commands/sticker.js' // @cat: media
import traduit from '../commands/traduit.js' // @cat: langues et études tudes
// Ajouter l'import
import compressCommand, { handleCompressResponse } from '../commands/compress.js' // @cat: media
import restart from '../commands/restart.js' // @cat: bot-menu
import silence from '../commands/silence.js' // @cat: gc-menu
import google from '../commands/google.js'
import img from '../commands/img.js' // @cat: media
import url from '../commands/url.js' // @cat: media
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

import * as set from '../commands/set.js' // @cat: bot-menu

import fancy from '../commands/fancy.js' // @cat: jeu et autres

import react from "../utils/react.js"
import ping from "../commands/ping.js" // @cat: bot-menu

import auto from '../commands/auto.js' // @cat: bot-menu

import runtime from '../commands/uptime.js' // @cat: bot-menu

import bb from '../commands/bb.js' // @cat: bot-menu
import gptCommand, { resetHistory as resetGptHistory, showGptHistory } from '../commands/gpt.js';

import akaneCommand, { resetAkaneHistory, showAkaneHistory } from '../commands/akane.js';

import alyaCommand, { resetAlyaHistory, showAlyaHistory } from '../commands/alya.js';
import insulte from '../commands/insulte.js' // @cat: jeu et autres

// ==================== CONFIGURATION GLOBALE ====================

const PAIR_SESSIONS_FILE = '../sessions/pair_sessions.json'

// ─── Vérifie si ce numéro est un bot parrain (pas le bot principal) ──────────

function isPairedBot(number) {

    try {

        if (!fsSync.existsSync(PAIR_SESSIONS_FILE)) return false;

        const list = JSON.parse(fsSync.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));

        return list.some(e => {
            const num = typeof e === 'object' ? e.number : e;
            return num === number && e?.status !== 'dead';
        });

    } catch (e) { return false; }

}

// ─────────────────────────────────────────────────────────────────────────────

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R'

const CHANNEL_NAME = 'ðŸðƒðŽÌˆðŽÌƒðŒ ð’ð“ðˆð‚ðŠð„ð‘ð’ Ê•â—•á´¥â—•Ê”ðŸŒ¹'

// ==================== Ã‰TAT SAKAMOTO ====================




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
        const localSudo = configmanager.config.users[number].sudoList || []
        const approvedUsers = [...new Set([...localSudo, ...getTrustedJids()])]
        
      // Détection automatique des liens
// ✅ Ne pas appliquer si message du bot lui-même
if (!message.key.fromMe) {
    const antilinkHandled = await handleAntilink(client, message);
    if (antilinkHandled) continue;
}
        if (!messageBody || !remoteJid) continue

        console.log('ðŸ“¨ Message:', messageBody.substring(0, 50))
        auto.autotype(client, message)
        auto.autorecord(client, message)
        //tag.respond(client, message)

        reactions.auto(
            client,
            message,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].reaction
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
                continue;
            }
        }

        if (messageBody === `${prefix}chatoff` || messageBody === `${prefix}chat off`) {
            if (publicMode || message.key.fromMe || approvedUsers.includes(message.key.participant || message.key.remoteJid)) {
                continue;
            }
        }

        const recrutHandled = await handleRecrutResponse(client, message, messageBody);
        if (recrutHandled) continue; 
        
        const stickerHandled = await handleStickerPackResponse(client, message);

if (stickerHandled) continue;

        // ==================== IA AKANE (MODE IA) ====================

        // ==================== GESTION DES COMMANDES ====================
 // Morpion sans préfixe

if (/^[1-9]$|^abandonner$/i.test(messageBody.trim())) {

    const moveHandled = await handleMove(client, message, messageBody.trim())

    if (moveHandled) continue

}       
        if (messageBody.startsWith(prefix) &&
            (publicMode ||
             message.key.fromMe ||
             approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
             isTrusted(message.key.participant || message.key.remoteJid) ||
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

    await react(client, message, '🎮')

    await tt(client, message, args)

    break
                case 'antilink': // @cat: gc-menu
                    await react(client, message)
                    await antilinkCommand(client, message, args)
                    break
                   
case 'message': // @cat: tools 

    await react(client, message, 'ðŸ“…')

    await messageCommand(client, message, args)

    break
                    

                case 'insulte': // @cat: tools 

                    await react(client, message)

                    await insulte(client, message)

                    break
                    
                    case 'ping': // @cat: bot-menu

case 'runtime':// @cat: bot-menu 

case 'uptime':// @cat: bot-menu 

      await react(client, message)              
    await runtime(client, message);

    break;
                case 'parrainage':

case 'referral': // @cat: bot-menu 

    return handleReferralCommand(client, message)
                    case 'darkgpt':

case 'dark':

                    
      await react(client, message)  
    await darkgpt(client, message);

    break;
                    

case 'setmenu':// @cat: bot-menu 

    await react(client, message)

    await setMenuCommand(client, message, args)

    break
                    
// Dans le switch
case 'links':     
    await links(client, message, args);
    break;
case 'song': // @cat: media

    await react(client, message, '🎵')

    await song(client, message, args)

    break
                    

case 'kick':// @cat: gc-menu 

    await react(client, message)

    await kickCommand(client, message, args)

    break
                    case 'menu': 
    await react(client, message, 'ðŸ‰')
    await menu(client, message)
    break
                    case 'deploie':
    await deploie(client, message);
    break;
                   case 'tgs': // @cat: media
    if (args[0]?.toLowerCase() === 'stop') {
        await tgsticker(client, message, args)
    }
    break
                    case 'ginfo':// @cat: gc-menu 

    await react(client, message)

    await ginfoCommand(client, message, args)

    break
case 'demoteall': //@cat: gc-menu
await react(client, message)
await demoteall(client, message)
break 
case 'fancy': // @cat: tools 
    await fancy(client, message, args);
    break;
                    
                // Commandes IA
case 'gpt':// @cat: ia et chat-bot 
    await react(client, message);
    await gptCommand(client, message, args);
    break;
case 'take': // @cat: media 

case 'steal':

case 'wm':

    await react(client, message);
              await take(client, message);

    break;

case 'akane':// @cat: ia et chat-bot 
    await react(client, message);
    await akaneCommand(client, message, args);
    break;

case 'alya':// @cat: ia et chat-bot 
    await react(client, message);
    await alyaCommand(client, message, args);
    break;    
                   case 'public': // @cat: bot-menu
                   case 'public mode':
                   case 'mode public':
                    await react(client, message)
                    await set.isPublic(message, client, 'on')
                    break
                    

case 'unpair':

    await react(client, message)

    await handleUnpairCommand(client, message, args)

    break
                    
       case 'setgpp':// @cat: gc-menu 
    await react(client, message)
    await setgppCommand(client, message, args)
    break
                case 'pairlist':// @cat: bot-menu 

case 'bots':

    await react(client, message)

    await handlePairListCommand(client, message)

    break

                   case 'private': // @cat: bot-menu
                   case 'private mode':
                   case 'mode private':
                   case 'mode privé':
                   case 'privé':
                    await react(client, message)
                    await set.isPublic(message, client, 'off')
                    break

      case 'duolingo': // @cat: langues et études

    await duolingoCommand(client, message, args)

    break    
                    case 'style': // @cat: tools
    await style(client, message, args);
    break;  
                    case 'pair': // @cat: bot-menu

    await react(client, message, '🔑')

    await handlePairCommand(client, message, args)

    break
                    case 'echo': // @cat: tools
    await react(client, message)
    await echoCommand(client, message, args)
    break
                    case 'sudo': // @cat: bot-menu
                        await react(client, message, '🛡️')
                        await sudoCommand(client, message, args)
                        break

                    case 'desudo': // @cat: bot-menu
                    case 'unsudo':
                        await react(client, message, '🗑️')
                        await desudoCommand(client, message, args)
                        break

                    case 'sudolist': // @cat: bot-menu
                        await react(client, message, '📋')
                        await sudoListCommand(client, message)
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
                    case 'repo': 
    await repo(client, message);
    break;
                
       case 'kickall':// @cat: gc-menu 
                   
 await react(client, message)

                    await group.kickall2(client, message)

                    break 
                       case 'sora': // @cat: ia et chat-bot

    case 'txt2img':

    case 'generate':

    case 'ia':
                    

 await react(client, message)

        await soraCommand(client, message, args)

        break
case 'tg':// @cat: media 
    await react(client, message, '🎭')
    await tgsticker(client, message, args)
    break 
                   
case 'recrut': 

    await react(client, message, 'âœ¨')

    await recrutCommand(client, message, args)

    break 
                    case 'welcome': // @cat: gc-menu
    await welcomeCommand(client, message, args);
    break;


                case 'photo': // @cat: media

                    await react(client, message)

                    await media.photo(client, message)

                    break
                    // Dans le switch
case 'mediafire': // @cat: media 
case 'mf':
    await mediafire(client, message, args);
    break;
                    case 'spack':

case 'stickerpack':

    await react(client, message)

    await stickerPackCommand(client, message, args)

    break
                    

case 'pin':

    await react(client, message)

    await pinCommand(client, message, args)

    break

case 'unpin':

    await react(client, message)

    await unpinCommand(client, message)

    break
                    case 'invite':// @cat; gc-menu

case 'gclink':

case 'lien':// @cat; gc-menu 

    await react(client, message)

    await invite(client, message)

    break

                case 'toaudio': // @cat: media

                    await react(client, message)

                    await media.tomp3(client, message)

                    break
                    case 'wss':

case 'wssp':

case 'wsstab':

case 'wssfull':

case 'wssweb':

    await react(client, message)

    await wss(client, message, args)

    break
                    case 'umute': // @cat: gc-menu
    await react(client, message)
    await parler(client, message)
    break

case 'mute': // @cat: gc-menu
    await react(client, message)
    await silence(client, message)
    break
                    
 case 'app': // @cat: media

                    await react(client, message)

                    await app(client, message, args)

                    break
                    

case 'approuve':// @cat: gc-menu 

    await react(client, message)

    await approveCommand(client, message, args)

    break

                case 'img': // @cat: media

                    await react(client, message)

                    await img(message, client)

                    break
                    case 'gs':

case 'gstatus':// @cat: gc-menu 

    await react(client, message)

    await gstatusCommand(client, message, args)

    break

                case 'vv': // @cat: media

                    await react(client, message)

                    await viewonce(client, message)

                    break
         
                case 'ytdl': //

                    await react(client, message)

                    await ytdlCommand(client, message, args)

                    break
                case 'tod': // @cat: games 
    await react(client, message, 'ðŸŽ²')
    await truthOrDareCommand(client, message, args)
    break   
         
                    
                case 'tiktok': // @cat: media

                    await react(client, message)

                    await tiktok(client, message)

                    break
                    case 'setgname':// @cat: gc-menu 

    await react(client, message)

    await setgnameCommand(client, message, args)

    break

case 'setgdesc':// @cat: gc-menu 

    await react(client, message)

    await setgdescCommand(client, message, args)

    break
                    case 'tagall':// @cat: gc-menu 

    await react(client, message)

    await tagallCommand(client, message, args)

    break

case 'tagadmin':// @cat: gc-menu 

    await react(client, message)

    await tagadminCommand(client, message, args)

    break

case 'tagmembers':// @cat: gc-menu 

    await react(client, message)

    await tagmembersCommand(client, message, args)

    break
                    
// Ajouter dans le switch
case 'citation': // @cat: histoire et citation
    await react(client, message)
    await citation(client, message, args)
    break
                case 'url': // @cat: media

                    await react(client, message)

                    await url(client, message)

                    break
                    
                    case 's':// @cat: media 

    case 'sticker':// @cat: media 


        await react(client, message); // Petit emoji pour dire "je travaille"

        await sticker(client, message, args);

        break;
                    
                case 'mail': // @cat: tools 

                    await react(client, message)

                    await mail(client, message, args)

                    break

              case 'compress': // @cat: media

    await react(client, message)

    await compressCommand(client, message, args)

    break  

                case 'hidetag': // @cat: gc-menu

                    await react(client, message)

                    await hidetagCommand(client, message, args)

                    break

                case 'antitag': // @cat: gc-menu

                    await react(client, message)

                    await antitagCommand(client, message, args)

                    break

                case 'promote':// @cat: gc-menu 

    await react(client, message)

    await promoteCommand(client, message, args)

    break

case 'demote':// @cat gc-menu 

    await react(client, message)

    await demoteCommand(client, message, args)

    break
         
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
                    case 'antilink': // @cat: gc-menu

    await react(client, message)

    await antilinkCommand(client, message, args)

    break
                case 'purge': // @cat: gc-menu
                    await react(client, message)
                    await group.kickall(client, message)
                    break
                case 'bb': // @cat: bot-menu

                    await react(client, message)

                    await bb(client, message)

                    break

case 'duo':
                    await react(client, message)

    await duolingoCommand(client, message, args)

    break
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

    await react(client, message)

    await quiz(client, message, args)

    break
                    
                case 'anime': // @cat: anime-mangas

                    await react(client, message)

                    await anime(client, message, args)

                    break
                    

case 'gcreate': // @cat: gc-menu 

    await react(client, message)

    await groupCreateCommand(client, message, args)

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

        }

    

}

export default handleIncomingMessage
