import fs from "fs"
import stylizedChar from "./fancy.js"

function getThumbnail() {
  const paths = ['./database/DigiX.jpg', './database/Digix.jpg', './database/DigixCo.jpg']
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p)
    } catch {}
  }
  return Buffer.alloc(0)
}

export default function stylizedCardMessage(text) {
  return {
    text: stylizedChar(text),
    contextInfo: {
      externalAdReply: {
        title: "AKANE MD",
        body: "🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹",
        thumbnail: getThumbnail(),
        sourceUrl: "https://whatsapp.com",
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }
}
