// utils/send.js

import configmanager from "./configmanager.js";

import { applyBotFont } from "../commands/botfont.js";

export async function sendMessage(client, jid, content, options = {}) {

  const botNumber = client.user.id.split(':')[0];

  

  if (content.text) {

    content.text = applyBotFont(content.text, botNumber);

  } else if (typeof content === 'string') {

    content = { text: applyBotFont(content, botNumber) };

  }

  

  return await client.sendMessage(jid, content, options);

}