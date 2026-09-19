const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const { render } = require('./registry');

async function sendMenu(sock, chatId, message, showAll = false) {
  const text = render(showAll ? 'ꜱᴀꜱᴜᴋᴇX SHOWALL' : 'ꜱᴀꜱᴜᴋᴇX MENU');
  const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
  const payload = fs.existsSync(imagePath)
    ? { image: fs.readFileSync(imagePath), caption: `${text}\n\n📌 Version: ${settings.version}\n📢 ${settings.channelLink}` }
    : { text: `${text}\n\n📌 Version: ${settings.version}\n📢 ${settings.channelLink}` };
  return sock.sendMessage(chatId, payload, { quoted: message });
}

async function helpCommand(sock, chatId, message) {
  return sendMenu(sock, chatId, message, false);
}
async function showAllCommand(sock, chatId, message) {
  return sendMenu(sock, chatId, message, true);
}

module.exports = helpCommand;
module.exports.helpCommand = helpCommand;
module.exports.showAllCommand = showAllCommand;
