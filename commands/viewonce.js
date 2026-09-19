function unwrapViewOnce(message) {
  const source = message?.message || message || {};
  return source.viewOnceMessageV2?.message || source.viewOnceMessage?.message || source.viewOnceMessageV2Extension?.message || source;
}
function getViewOnceQuoted(message) {
  const quoted = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return null;
  const unwrapped = unwrapViewOnce(quoted);
  const found = ['imageMessage', 'videoMessage', 'audioMessage'].find(key => unwrapped?.[key]?.viewOnce || quoted?.viewOnceMessageV2 || quoted?.viewOnceMessage);
  return found ? { key: found, source: unwrapped[found] } : null;
}
async function toBuffer(content, type) {
  const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
  const stream = await downloadContentFromMessage(content, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
async function viewOnceCommand(sock, chatId, message) {
  const item = getViewOnceQuoted(message);
  if (!item) return sock.sendMessage(chatId, { text: '❌ View-once photo, video ya audio ko reply karke .wow use karo.' }, { quoted: message });
  const type = item.key.replace('Message', '');
  const outputType = type;
  const buffer = await toBuffer(item.source, type);
  const payload = { [outputType]: buffer };
  if (outputType !== 'audio') payload.caption = item.source.caption || '';
  else payload.mimetype = item.source.mimetype || 'audio/mpeg';
  return sock.sendMessage(chatId, payload, { quoted: message });
}
module.exports = viewOnceCommand;
module.exports.getViewOnceQuoted = getViewOnceQuoted;
