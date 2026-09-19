const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function toBuffer(content, type) {
  const stream = await downloadContentFromMessage(content, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function viewonceCommand(sock, chatId, message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || {};
  const candidates = [
    ['imageMessage', 'image', 'image', 'media.jpg'],
    ['videoMessage', 'video', 'video', 'media.mp4'],
    ['audioMessage', 'audio', 'audio', 'media.mp3']
  ];
  const item = candidates.find(([key]) => quoted[key]?.viewOnce || quoted[key]?.viewOnceMessage);
  if (!item) return sock.sendMessage(chatId, { text: '❌ View-once photo, video ya audio ko reply karke .wow use karo.' }, { quoted: message });
  const [key, type, outputType, fileName] = item;
  const source = quoted[key];
  const buffer = await toBuffer(source, type);
  const payload = { [outputType]: buffer, fileName };
  if (outputType !== 'audio') payload.caption = source.caption || '';
  else payload.mimetype = source.mimetype || 'audio/mpeg';
  return sock.sendMessage(chatId, payload, { quoted: message });
}
module.exports = viewonceCommand;
