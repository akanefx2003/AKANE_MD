// commands/tr.js

import axios from "axios";

import { applyBotFont } from "./botfont.js";

async function tr(message, client) {

    const botNumber = client.user.id.split(':')[0];

    const remoteJid = message.key.remoteJid;

    const text =

        message.message?.conversation ||

        message.message?.extendedTextMessage?.text ||

        "";

    const args = text.trim().split(/\s+/).slice(1);

    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const quotedText =

        quotedMsg?.conversation ||

        quotedMsg?.extendedTextMessage?.text ||

        "";

    if (args.length < 1) {

        const helpMessage =

            "╭─❍ *TRANSLATION*\n" +

            "│\n" +

            "│ ⚉ Usage:\n" +

            "│   .tr <lang> <text>\n" +

            "│   .tr <lang> (reply to message)\n" +

            "│\n" +

            "│ 𖣘 Examples:\n" +

            "│   .tr en Bonjour\n" +

            "│   .tr fr Hello\n" +

            "│   .tr es How are you?\n" +

            "│   .tr en (reply to message)\n" +

            "│\n" +

            "│ 📋 Codes:\n" +

            "│   fr = French | en = English\n" +

            "│   es = Spanish | de = German\n" +

            "│   pt = Portuguese | ar = Arabic\n" +

            "│   ru = Russian | zh = Chinese\n" +

            "│   ja = Japanese | ko = Korean\n" +

            "│   ha = Hausa | sw = Swahili\n" +

            "│   yo = Yoruba | ig = Igbo\n" +

            "│   ln = Lingala\n" +

            "│\n" +

            "╰──────────────────";

        

        const styledHelp = applyBotFont(helpMessage, botNumber);

        return await client.sendMessage(remoteJid, { text: styledHelp });

    }

    const langCode = args[0]?.toLowerCase();

    

    let textToTranslate;

    

    if (quotedText) {

        textToTranslate = quotedText;

    }

    else if (args.length >= 2) {

        textToTranslate = args.slice(1).join(" ");

    }

    else {

        const helpMessage =

            "╭─❍ *TRANSLATION*\n" +

            "│\n" +

            "│ ⚉ Usage:\n" +

            "│   .tr <lang> <text>\n" +

            "│   .tr <lang> (reply to message)\n" +

            "│\n" +

            "│ 𖣘 Examples:\n" +

            "│   .tr en Bonjour\n" +

            "│   .tr fr Hello\n" +

            "│   .tr es How are you?\n" +

            "│   .tr en (reply to message)\n" +

            "│\n" +

            "╰──────────────────";

        

        const styledHelp = applyBotFont(helpMessage, botNumber);

        return await client.sendMessage(remoteJid, { text: styledHelp });

    }

    try {

        const waitingMsg = applyBotFont("_×͜× Translating..._", botNumber);

        await client.sendMessage(remoteJid, { text: waitingMsg });

        const apiUrl = `https://lingva.ml/api/v1/${langCode}/en/${encodeURIComponent(textToTranslate)}`;

        const response = await axios.get(apiUrl, { timeout: 10000 });

        if (!response.data || !response.data.translation) {

            throw new Error("No translation returned");

        }

        const translated = response.data.translation;

        const resultMessage =

            "╭─❍ *TRANSLATION*\n" +

            "│\n" +

            `│ 🌐 To: ${langCode.toUpperCase()}\n` +

            "│\n" +

            "│ ✐ Original:\n" +

            `│ _${textToTranslate.slice(0, 200)}_\n` +

            "│\n" +

            "│ ℘ Translated:\n" +

            `│ _${translated}_\n` +

            "│\n" +

            "╰──────────────────";

        

        const styledResult = applyBotFont(resultMessage, botNumber);

        await client.sendMessage(remoteJid, { text: styledResult });

    } catch (error) {

        console.error("TR ERROR:", error.message);

        try {

            const altUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(textToTranslate)}`;

            const altResponse = await axios.get(altUrl, { timeout: 10000 });

            if (altResponse.data && altResponse.data[0]) {

                const translated = altResponse.data[0]

                    .filter(item => item[0])

                    .map(item => item[0])

                    .join("");

                const resultMessage =

                    "╭─❍ *TRANSLATION*\n" +

                    "│\n" +

                    `│ 🌐 To: ${langCode.toUpperCase()}\n` +

                    "│\n" +

                    "│ ✐ Original:\n" +

                    `│ _${textToTranslate.slice(0, 200)}_\n` +

                    "│\n" +

                    "│ ℘ Translated:\n" +

                    `│ _${translated}_\n` +

                    "│\n" +

                    "╰──────────────────";

                

                const styledResult = applyBotFont(resultMessage, botNumber);

                return await client.sendMessage(remoteJid, { text: styledResult });

            }

        } catch (fallbackErr) {

            console.error("TR FALLBACK ERROR:", fallbackErr.message);

        }

        const errorMsg = applyBotFont("`⟁⃝ Not Available! ℘`", botNumber);

        await client.sendMessage(remoteJid, { text: errorMsg });

    }

}

export default tr;