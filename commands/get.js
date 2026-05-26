import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function get(client, message, args) {
    try {
        const remoteJid = message.key.remoteJid

        // Récupérer le message complet
        const fullMessage = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           ''

        // Extraire le nom du fichier
        const parts = fullMessage.trim().split(/\s+/)

        let fileName = null
        if (parts.length >= 2) {
            fileName = parts[1]
        } else if (args && args.length > 0) {
            fileName = args[0]
        }

        // Définir les dossiers des commandes et des events
        const commandsDir = path.join(__dirname, '../commands')
        const eventsDir = path.join(__dirname, '../events')

        // Si aucun fichier n'est spécifié
        if (!fileName) {
            let commandsList = []
            let eventsList = []

            try {
                commandsList = fs.readdirSync(commandsDir)
                    .filter(file => file.endsWith('.js'))
                    .map(file => `• ${file}`)
            } catch (err) {
                console.error('❌ Erreur lecture commands:', err)
            }

            try {
                eventsList = fs.readdirSync(eventsDir)
                    .filter(file => file.endsWith('.js'))
                    .map(file => `• ${file}`)
            } catch (err) {
                console.error('❌ Erreur lecture events:', err)
            }

            return await client.sendMessage(remoteJid, { 
                text: `❌ *Fichier manquant !*\n\n📂 *COMMANDS* :\n${commandsList.slice(0, 15).join('\n') || '• Aucun'}\n\n📂 *EVENTS* :\n${eventsList.slice(0, 15).join('\n') || '• Aucun'}\n\n💡 Ex: *.get song.js*` 
            })
        }

        // Sécurité
        if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
            return await client.sendMessage(remoteJid, { 
                text: '❌ *Nom invalide !*' 
            })
        }

        // S'assurer que le fichier a l'extension .js
        const safeFileName = fileName.endsWith('.js') ? fileName : `${fileName}.js`

        // Vérifier d'abord dans commands, puis dans events
        let filePath = path.join(commandsDir, safeFileName)
        let isInEvents = false

        if (!fs.existsSync(filePath)) {
            filePath = path.join(eventsDir, safeFileName)
            if (fs.existsSync(filePath)) {
                isInEvents = true
            }
        }

        // Si le fichier n'existe pas
        if (!fs.existsSync(filePath)) {
            let commandsList = []
            let eventsList = []

            try {
                commandsList = fs.readdirSync(commandsDir)
                    .filter(file => file.endsWith('.js'))
                    .map(file => `• ${file}`)
            } catch (err) {}

            try {
                eventsList = fs.readdirSync(eventsDir)
                    .filter(file => file.endsWith('.js'))
                    .map(file => `• ${file}`)
            } catch (err) {}

            return await client.sendMessage(remoteJid, { 
                text: `❌ *${safeFileName} introuvable !*\n\n📂 *COMMANDS* :\n${commandsList.slice(0, 15).join('\n') || '• Aucun'}\n\n📂 *EVENTS* :\n${eventsList.slice(0, 15).join('\n') || '• Aucun'}` 
            })
        }

        // Vérifier si c'est un fichier
        const stats = fs.statSync(filePath)
        if (!stats.isFile()) {
            return await client.sendMessage(remoteJid, { 
                text: `❌ *${safeFileName}* n'est pas un fichier !` 
            })
        }

        // Lire le contenu du fichier
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const folder = isInEvents ? 'events' : 'commands'
        const fileSize = (stats.size / 1024).toFixed(2)

        // Créer le caption avec cadre
        const caption = `╭─✧🌹━━━━━━━━━━━━━❂\n┊\n*┊📄 ${safeFileName}*\n*┊📂 ${folder}*\n*┊📊 ${fileSize} KB*\n┊\n╰────────────────❂`

        // Vérifier la taille du contenu
        const nativeFlows = []
        
        // Si le code est moins de 8000 caractères, l'ajouter au bouton
        if (fileContent.length <= 8000) {
            nativeFlows.push({
                text: '📋 Copier code',
                copy: fileContent
            })
        }

        // Envoyer le fichier avec caption et bouton (si applicable)
        await client.sendMessage(remoteJid, { 
            document: fs.readFileSync(filePath),
            fileName: safeFileName,
            mimetype: 'application/javascript',
            caption: caption,
            ...(nativeFlows.length > 0 && { nativeFlow: nativeFlows })
        })

        // Si le fichier est très gros, envoyer un message informatif
        if (fileContent.length > 8000) {
            await client.sendMessage(remoteJid, {
                text: '📎 *Fichier trop volumineux pour le bouton copier*\n\n💾 *Télécharge le fichier directement !*'
            })
        }

    } catch (error) {
        console.error('❌ Erreur get.js:', error)
        await client.sendMessage(message.key.remoteJid, { 
            text: `❌ *Erreur: ${error.message}*` 
        })
    }
}
