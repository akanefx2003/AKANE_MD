import axios from "axios";

async function tr(message, client) {
    const remoteJid = message.key.remoteJid;

    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";

    const args = text.trim().split(/\s+/).slice(1);

    // Check if replying to a message
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText =
        quotedMsg?.conversation ||
        quotedMsg?.extendedTextMessage?.text ||
        "";

    // Show usage if no args and no reply
    if (args.length < 1) {
        return await client.sendMessage(remoteJid, {
            text:
                "🌐 *TRANSLATION*\n\n" +
                "⚉ Usage:\n" +
                "  .tr <lang> <text>\n" +
                "  .tr <lang> (reply to message)\n\n" +
                "𖣘 Examples:\n" +
                "  .tr en Bonjour\n" +
                "  .tr fr Hello\n" +
                "  .tr es How are you?\n" +
                "  .tr en (reply to message)\n\n" +
                "📋 Codes:\n" +
                "  fr = French\n" +
                "  en = English\n" +
                "  es = Spanish\n" +
                "  de = German\n" +
                "  pt = Portuguese\n" +
                "  ar = Arabic\n" +
                "  ru = Russian\n" +
                "  zh = Chinese\n" +
                "  ja = Japanese\n" +
                "  ko = Korean\n" +
                "  ha = Hausa\n" +
                "  sw = Swahili\n" +
                "  yo = Yoruba\n" +
                "  ig = Igbo\n" +
                "  ln = Lingala"
        });
    }

    const langCode = args[0]?.toLowerCase();
    
    let textToTranslate;
    
    // MODE 1: Reply to a message → translate the quoted text
    if (quotedText) {
        textToTranslate = quotedText;
    }
    // MODE 2: Text provided directly in command
    else if (args.length >= 2) {
        textToTranslate = args.slice(1).join(" ");
    }
    // Neither: show usage
    else {
        return await client.sendMessage(remoteJid, {
            text:
                "🌐 *TRANSLATION*\n\n" +
                "⚉ Usage:\n" +
                "  .tr <lang> <text>\n" +
                "  .tr <lang> (reply to message)\n\n" +
                "𖣘 Examples:\n" +
                "  .tr en Bonjour\n" +
                "  .tr fr Hello\n" +
                "  .tr es How are you?\n" +
                "  .tr en (reply to message)\n\n" +
                "📋 Codes:\n" +
                "  fr = French\n" +
                "  en = English\n" +
                "  es = Spanish\n" +
                "  de = German\n" +
                "  pt = Portuguese\n" +
                "  ar = Arabic\n" +
                "  ru = Russian\n" +
                "  zh = Chinese\n" +
                "  ja = Japanese\n" +
                "  ko = Korean\n" +
                "  ha = Hausa\n" +
                "  sw = Swahili\n" +
                "  yo = Yoruba\n" +
                "  ig = Igbo\n" +
                "  ln = Lingala"
        });
    }

    try {
        await client.sendMessage(remoteJid, {
            text: `_×͜× Translating..._`
        });

        // Primary API
        const apiUrl = `https://lingva.ml/api/v1/${langCode}/en/${encodeURIComponent(textToTranslate)}`;

        const response = await axios.get(apiUrl, { timeout: 10000 });

        if (!response.data || !response.data.translation) {
            throw new Error("No translation returned");
        }

        const translated = response.data.translation;

        await client.sendMessage(remoteJid, {
            text:
                `╭─❍ *TRANSLATION*\n│\n` +
                `│ 🌐 To: ${langCode.toUpperCase()}\n` +
                `│\n` +
                `│ ℘  Original:\n` +
                `│ _${textToTranslate.slice(0, 200)}_\n` +
                `│\n` +
                `│ 𓂃✍︎ Translated:\n` +
                `│ _${translated}_\n` +
                `│\n` +
                `╰──────────────────`
        });

    } catch (error) {
        console.error("TR ERROR:", error.message);

        // Fallback: Google Translate
        try {
            const altUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(textToTranslate)}`;

            const altResponse = await axios.get(altUrl, { timeout: 10000 });

            if (altResponse.data && altResponse.data[0]) {
                const translated = altResponse.data[0]
                    .filter(item => item[0])
                    .map(item => item[0])
                    .join("");

                return await client.sendMessage(remoteJid, {
                    text:
                        `╭─❍ *TRANSLATION*\n│\n` +
                        `│ 🌐 To: ${langCode.toUpperCase()}\n` +
                        `│\n` +
                        `│ ✐ Original:\n` +
                        `│ _${textToTranslate.slice(0, 200)}_\n` +
                        `│\n` +
                        `│ ℘ Translated:\n` +
                        `│ _${translated}_\n` +
                        `│\n╰──────────────────`
                });
            }
        } catch (fallbackErr) {
            console.error("TR FALLBACK ERROR:", fallbackErr.message);
        }

        await client.sendMessage(remoteJid, {
            text: "`⟁⃝ Not Available! ℘`"
        });
    }
}

export default tr;