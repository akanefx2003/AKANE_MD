// commands/add.js - Créer un fichier avec le contenu exact

import fs from 'fs/promises';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Extensions autorisées (tu peux les modifier)

const allowedExtensions = ['.js', '.json', '.txt', '.md', '.html', '.css', '.py', '.sh', '.bat', '.xml', '.yaml', '.yml', '.sql'];

// Extensions bloquées par sécurité

const blockedExtensions = ['.exe', '.dll', '.bin', '.dat', '.so'];

export default async function add(client, message) {

    const remoteJid = message.key.remoteJid;

    

    // Récupérer le message

    const body = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

    const args = body.trim().split(/\s+/).slice(1);

    

    // Vérifier les arguments

    if (args.length < 2) {

        await client.sendMessage(remoteJid, {

            text: '📁 *Commande Add*\n\n_.add <nom_fichier> <contenu>_\n\n📌 Exemple :\n_.add test.js console.log("Hello")_\n\n📌 Pour plusieurs lignes, entoure le code avec ``` ```'

        });

        return;

    }

    

    const fileName = args[0];

    const ext = path.extname(fileName).toLowerCase();

    

    // Vérifier l'extension

    if (blockedExtensions.includes(ext)) {

        await client.sendMessage(remoteJid, { text: `❌ Extension *${ext}* non autorisée pour des raisons de sécurité.` });

        return;

    }

    

    if (!allowedExtensions.includes(ext) && allowedExtensions.length > 0) {

        await client.sendMessage(remoteJid, { text: `❌ Extension *${ext}* non supportée. Extensions autorisées : ${allowedExtensions.join(', ')}` });

        return;

    }

    

    // Nettoyer le nom du fichier (éviter les caractères dangereux)

    const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '');

    if (safeName !== fileName) {

        await client.sendMessage(remoteJid, { text: '❌ Nom de fichier invalide. Utilise seulement lettres, chiffres, points, tirets et underscores.' });

        return;

    }

    

    // Récupérer le contenu (tout après le nom)

    let content = args.slice(1).join(' ');

    

    // Si l'utilisateur a entouré le code avec ```, les enlever

    if (content.startsWith('```') && content.endsWith('```')) {

        content = content.slice(3, -3).trim();

    } else if (content.startsWith('`') && content.endsWith('`')) {

        content = content.slice(1, -1);

    }

    

    // Déterminer le dossier de destination (par défaut, la racine)

    let targetDir = process.cwd();

    

    // Si le nom contient un chemin (ex: "utils/test.js"), créer les dossiers

    if (safeName.includes('/')) {

        const parts = safeName.split('/');

        const folders = parts.slice(0, -1);

        let currentDir = process.cwd();

        for (const folder of folders) {

            currentDir = path.join(currentDir, folder);

            try {

                await fs.access(currentDir);

            } catch {

                await fs.mkdir(currentDir, { recursive: true });

            }

        }

        targetDir = currentDir;

    }

    

    const filePath = path.join(targetDir, path.basename(safeName));

    

    try {

        // Écrire le fichier avec le contenu EXACT (sans aucun ajout)

        await fs.writeFile(filePath, content, 'utf8');

        const sizeKB = (content.length / 1024).toFixed(2);

        

        await client.sendMessage(remoteJid, {

            text: `✅ *Fichier créé avec succès !*\n📁 *Nom :* ${safeName}\n📊 *Taille :* ${sizeKB} Ko\n📂 *Chemin :* ${filePath}\n\n> 🔄 Redémarre le bot si nécessaire.`

        });

    } catch (error) {

        console.error('Erreur création fichier:', error);

        await client.sendMessage(remoteJid, { text: `❌ Erreur : ${error.message}` });

    }

}