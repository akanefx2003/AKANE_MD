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

                console.error('❌ Erreur lecture dossier commands:', err)

            }

            try {

                eventsList = fs.readdirSync(eventsDir)

                    .filter(file => file.endsWith('.js'))

                    .map(file => `• ${file}`)

            } catch (err) {

                console.error('❌ Erreur lecture dossier events:', err)

            }

            const allFiles = [...commandsList, ...eventsList]

            const filesText = allFiles.join('\n')

            return await client.sendMessage(remoteJid, { 

                text: `❌ Veuillez spécifier un fichier !\n\n📁 *Fichiers disponibles:*\n\n📂 *commands/*\n${commandsList.join('\n') || '• Aucun'}\n\n📂 *events/*\n${eventsList.join('\n') || '• Aucun'}\n\nExemple: *.get messageHandler.js*` 

            })

        }

        // Sécurité

        if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {

            return await client.sendMessage(remoteJid, { 

                text: '❌ Nom de fichier invalide !' 

            })

        }

        // S'assurer que le fichier a l'extension .js

        const safeFileName = fileName.endsWith('.js') ? fileName : `${fileName}.js`

        // Vérifier d'abord dans le dossier commands, puis dans events

        let filePath = path.join(commandsDir, safeFileName)

        let isInEvents = false

        if (!fs.existsSync(filePath)) {

            filePath = path.join(eventsDir, safeFileName)

            if (fs.existsSync(filePath)) {

                isInEvents = true

            }

        }

        // Si le fichier n'existe pas dans les deux dossiers

        if (!fs.existsSync(filePath)) {

            let commandsList = []

            let eventsList = []

            try {

                commandsList = fs.readdirSync(commandsDir)

                    .filter(file => file.endsWith('.js'))

                    .map(file => `• ${file}`)

            } catch (err) {

                console.error('❌ Erreur lecture dossier commands:', err)

            }

            try {

                eventsList = fs.readdirSync(eventsDir)

                    .filter(file => file.endsWith('.js'))

                    .map(file => `• ${file}`)

            } catch (err) {

                console.error('❌ Erreur lecture dossier events:', err)

            }

            const allFiles = [...commandsList, ...eventsList]

            const filesText = allFiles.join('\n')

            return await client.sendMessage(remoteJid, { 

                text: `❌ Le fichier *${safeFileName}* n'existe pas !\n\n📁 *Fichiers disponibles:*\n\n📂 *commands/*\n${commandsList.join('\n') || '• Aucun'}\n\n📂 *events/*\n${eventsList.join('\n') || '• Aucun'}` 

            })

        }

        // Vérifier si c'est un fichier

        const stats = fs.statSync(filePath)

        if (!stats.isFile()) {

            return await client.sendMessage(remoteJid, { 

                text: `❌ *${safeFileName}* n'est pas un fichier valide !` 

            })

        }

        const folder = isInEvents ? 'events' : 'commands'

        // Envoyer uniquement le fichier en pièce jointe (pas de code dans le chat)

        await client.sendMessage(remoteJid, { 

            document: fs.readFileSync(filePath),

            fileName: safeFileName,

            mimetype: 'application/javascript',

            caption: `✅ *${folder}/${safeFileName}*\n📊 *${(stats.size / 1024).toFixed(2)} KB*\n🕒 *Modifié : ${stats.mtime.toLocaleString()}*`

        })

    } catch (error) {

        console.error('❌ Erreur dans get.js:', error)

        await client.sendMessage(message.key.remoteJid, { 

            text: `❌ Erreur: ${error.message}` 

        })

    }

}