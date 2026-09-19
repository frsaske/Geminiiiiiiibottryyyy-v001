const fs = require('fs');
const path = require('path');
const axios = require('axios');
const isOwnerOrSudo = require('../lib/isOwner');
const settings = require('../settings');
const CONFIG = path.join(process.cwd(), 'data', 'autoFeatures.json');
const defaults = { autoreact: false, autoseen: false, autoonline: false, autoreply: false };
function read() { try { return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG, 'utf8')) }; } catch (_) { return { ...defaults }; } }
function save(data) { fs.writeFileSync(CONFIG, JSON.stringify(data, null, 2)); }
async function toggle(sock, chatId, message, feature, value) {
  const sender = message.key.participant || message.key.remoteJid;
  if (!message.key.fromMe && !(await isOwnerOrSudo(sender, sock, chatId))) return sock.sendMessage(chatId, { text: '❌ Owner only command.' }, { quoted: message });
  const data = read();
  if (!['on', 'off', 'status'].includes(value)) return sock.sendMessage(chatId, { text: `Usage: .${feature} on/off` }, { quoted: message });
  if (value === 'status') return sock.sendMessage(chatId, { text: `.${feature}: ${data[feature] ? 'ON' : 'OFF'}` }, { quoted: message });
  data[feature] = value === 'on'; save(data);
  return sock.sendMessage(chatId, { text: `✅ ${feature}: ${data[feature] ? 'ON' : 'OFF'}` }, { quoted: message });
}

async function handleAutoReply(sock, chatId, message, text) {
  const data = read();
  if (!data.autoreply || !text || message.key.fromMe) return;
  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.geminiApiKey}`, {
      contents: [{ parts: [{ text: text }] }],
      system_instruction: { parts: [{ text: "You are a helpful and friendly WhatsApp bot assistant. Keep your responses concise, engaging, and human-like." }] }
    });
    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (answer) {
      await sock.sendMessage(chatId, { text: answer }, { quoted: message });
    }
  } catch (error) {
    console.error('[autoreply] Error:', error.response?.data?.error?.message || error.message);
  }
}
async function handlePresence(sock, message) {
  const data = read(); if (data.autoseen) try { await sock.readMessages([message.key]); } catch (_) {}
  if (data.autoonline) try { await sock.sendPresenceUpdate('available', message.key.remoteJid); } catch (_) {}
}
module.exports = { read, save, toggle, handleAutoReply, handlePresence };
