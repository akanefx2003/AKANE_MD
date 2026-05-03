// commands/botfont.js

import configmanager from "../utils/configmanager.js";

// Styles disponibles pour le bot (sans stylizedChar externe)

const styles = {

  '1': { name: 'normal', func: (text) => text },

  '2': { name: 'bold', func: (text) => `*${text}*` },

  '3': { name: 'italic', func: (text) => `_${text}_` },

  '4': { name: 'mono', func: (text) => `\`${text}\`` },

  '5': { name: 'strike', func: (text) => `~${text}~` },

  '6': { name: 'spoiler', func: (text) => `||${text}||` },

  '7': { name: 'small', func: (text) => text.toLowerCase() },

  '8': { name: 'up', func: (text) => text.toUpperCase() },

  '9': { name: 'capital', func: (text) => text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') },

  '10': { name: 'inverse', func: (text) => text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },

  '11': { name: 'fancy', func: (text) => {

    const map = {

      a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘',

      h: '𝕙', i: '𝕚', j: '𝕛', k: '𝕜', l: '𝕝', m: '𝕞', n: '𝕟',

      o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣', s: '𝕤', t: '𝕥', u: '𝕦',

      v: '𝕧', w: '𝕨', x: '𝕩', y: '𝕪', z: '𝕫',

      A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾',

      H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ',

      O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌',

      V: '𝕍', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ'

    };

    return text.split('').map(c => map[c] || c).join('');

  } },

  '12': { name: 'cursive', func: (text) => {

    const map = {

      a: '𝒶', b: '𝒷', c: '𝒸', d: '𝒹', e: 'ℯ', f: '𝒻', g: 'ℊ',

      h: '𝒽', i: '𝒾', j: '𝒿', k: '𝓀', l: '𝓁', m: '𝓂', n: '𝓃',

      o: 'ℴ', p: '𝓅', q: '𝓆', r: '𝓇', s: '𝓈', t: '𝓉', u: '𝓊',

      v: '𝓋', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏',

      A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢',

      H: 'ℋ', I: 'ℐ', J: '𝒥', K: '𝒦', L: 'ℒ', M: 'ℳ', N: '𝒩',

      O: '𝒪', P: '𝒫', Q: '𝒬', R: 'ℛ', S: '𝒮', T: '𝒯', U: '𝒰',

      V: '𝒱', W: '𝒲', X: '𝒳', Y: '𝒴', Z: '𝒵'

    };

    return text.split('').map(c => map[c] || c).join('');

  } },

  '13': { name: 'double', func: (text) => {

    const map = {

      a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘',

      h: '𝕙', i: '𝕚', j: '𝕛', k: '𝕜', l: '𝕝', m: '𝕞', n: '𝕟',

      o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣', s: '𝕤', t: '𝕥', u: '𝕦',

      v: '𝕧', w: '𝕨', x: '𝕩', y: '𝕪', z: '𝕫',

      A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾',

      H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ',

      O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌',

      V: '𝕍', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ'

    };

    return text.split('').map(c => map[c] || c).join('');

  } },

  '14': { name: 'immortal', func: (text) => {

    const map = {

      a: '𝖆', b: '𝖇', c: '𝖈', d: '𝖉', e: '𝖊', f: '𝖋', g: '𝖌',

      h: '𝖍', i: '𝖎', j: '𝖏', k: '𝖐', l: '𝖑', m: '𝖒', n: '𝖓',

      o: '𝖔', p: '𝖕', q: '𝖖', r: '𝖗', s: '𝖘', t: '𝖙', u: '𝖚',

      v: '𝖛', w: '𝖜', x: '𝖝', y: '𝖞', z: '𝖟',

      A: '𝕬', B: '𝕭', C: '𝕮', D: '𝕯', E: '𝕰', F: '𝕱', G: '𝕲',

      H: '𝕳', I: '𝕴', J: '𝕵', K: '𝕶', L: '𝕷', M: '𝕸', N: '𝕹',

      O: '𝕺', P: '𝕻', Q: '𝕼', R: '𝕽', S: '𝕾', T: '𝕿', U: '𝖀',

      V: '𝖁', W: '𝖂', X: '𝖃', Y: '𝖄', Z: '𝖅'

    };

    return text.split('').map(c => map[c] || c).join('');

  } }

};

// Fonction pour ne pas styliser les liens

function preserveLinks(text, styleFunc) {

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const urls = [];

  

  const textWithoutUrls = text.replace(urlRegex, (match) => {

    urls.push(match);

    return `__URL_${urls.length - 1}__`;

  });

  

  const styledText = styleFunc(textWithoutUrls);

  

  let result = styledText;

  urls.forEach((url, i) => {

    result = result.replace(`__URL_${i}__`, url);

  });

  

  return result;

}

// Fonction pour appliquer le style sauvegardé

export function applyBotFont(text, botNumber) {

  const savedStyle = configmanager.config.users?.[botNumber]?.botfont || '1';

  const styleObj = styles[savedStyle] || styles['1'];

  return preserveLinks(text, styleObj.func);

}

export default async function botfont(client, message, args) {

  try {

    const remoteJid = message.key.remoteJid;

    const botNumber = client.user.id.split(':')[0];

    const prefix = configmanager.config.users?.[botNumber]?.prefix || '.';

    const currentStyleNum = configmanager.config.users?.[botNumber]?.botfont || '1';

    const currentStyle = styles[currentStyleNum];

    

    if (args.length === 0 || args[0] === 'help') {

      let helpText = `╭─❍ *📝 BOTFONT - POLICES*

│

│ Choisis un numéro pour changer la police !

│

├─❍ *🎨 STYLES :*

│

`;

      

      for (const [num, style] of Object.entries(styles)) {

        const example = preserveLinks(`exemple`, style.func);

        helpText += `│ ${num} → ${style.name} : ${example}\n`;

      }

      

      helpText += `│

├─❍ *📌 UTILISATION :*

│ ${prefix}botfont <numéro>

│

├─❍ *✨ EXEMPLES :*

│ ${prefix}botfont 1    → normal

│ ${prefix}botfont 11   → fancy

│ ${prefix}botfont 14   → immortal

│

├─❍ *🔧 STYLE ACTUEL :*

│ ${currentStyleNum} → ${currentStyle.name}

│

╰──────────────────`;

      

      await client.sendMessage(remoteJid, { text: helpText });

      return;

    }

    

    const styleNum = args[0];

    

    if (styles[styleNum]) {

      if (!configmanager.config.users[botNumber]) {

        configmanager.config.users[botNumber] = {};

      }

      configmanager.config.users[botNumber].botfont = styleNum;

      configmanager.save();

      

      await client.sendMessage(remoteJid, { 

        text: `✅ *Police changée !*\n\nStyle : ${styles[styleNum].name}\n\nMaintenant tous mes messages utiliseront ce style !`

      });

    } else {

      await client.sendMessage(remoteJid, { 

        text: `❌ Style *${styleNum}* invalide.\nUtilise *${prefix}botfont help* pour voir les styles.`

      });

    }

    

  } catch (error) {

    console.error("Erreur botfont:", error);

    await client.sendMessage(message.key.remoteJid, { 

      text: "❌ Erreur lors du changement de police\n\n" + error.message

    }, { quoted: message });

  }

}