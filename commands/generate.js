// commands/generate.js - GÉNÉRATION D'IMAGE PAR IA (gratuit, sans clé)

async function generate(client, message) {

    try {

        const remoteJid = message.key.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        

        // Extraire le prompt après la commande .generate ou .gen

        let prompt = messageBody.trim();

        if (prompt.startsWith('.generate')) prompt = prompt.slice(9).trim();

        else if (prompt.startsWith('.gen')) prompt = prompt.slice(4).trim();

        else if (prompt.startsWith('.iaimg')) prompt = prompt.slice(6).trim();

        else prompt = '';

        

        if (!prompt) {

            await client.sendMessage(remoteJid, {

                text: '> *🎨 GÉNÉRATION D\'IMAGE IA*\n> 📝 _.generate un chat noir_\n> 🔥 _.gen un paysage_\n> ✨ _.iaimg une voiture_'

            });

            return;

        }

        

        // Message d'attente

        await client.sendMessage(remoteJid, {

            text: `> *🖼️ GÉNÉRATION EN COURS...*\n> 📝 _${prompt.substring(0, 60)}_`

        });

        

        // Appel API Pollinations.ai (gratuit, sans clé)

        const encoded = encodeURIComponent(prompt);

        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true`;

        const response = await fetch(url);

        

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        

        const buffer = await response.arrayBuffer();

        

        // Envoi de l'image générée

        await client.sendMessage(remoteJid, {

            image: Buffer.from(buffer),

            caption: `> *✨ IMAGE GÉNÉRÉE*\n> 📝 _${prompt}_\n> 🤖 _Pollinations.ai_\n> 🍁 **AKANE MD**`

        });

        

        console.log(`✅ Image générée : ${prompt}`);

    } catch (error) {

        console.error('❌ Erreur generate:', error);

        await client.sendMessage(message.key.remoteJid, {

            text: '> *❌ ERREUR GÉNÉRATION*\n> ⚠️ Réessaie plus tard ou change ta description.'

        });

    }

}

export default { generate };