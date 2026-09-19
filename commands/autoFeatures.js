require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const isOwnerOrSudo = require('../lib/isOwner');

const CONFIG = path.join(process.cwd(), 'data', 'autoFeatures.json');
const defaults = { autoreact: false, autoseen: false, autoonline: false, autoreply: false };
const historyByChat = new Map();

function read() {
  try { return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG, 'utf8')) }; }
  catch (_) { return { ...defaults }; }
}
function save(data) { fs.writeFileSync(CONFIG, JSON.stringify(data, null, 2)); }
function remember(chatId, text, sender) {
  if (!chatId || !text) return;
  const history = historyByChat.get(chatId) || [];
  history.push({ sender: sender || 'user', text: String(text).slice(0, 1200), at: new Date().toISOString() });
  historyByChat.set(chatId, history.slice(-25));
}
function getHistory(chatId) { return historyByChat.get(chatId) || []; }

async function generateGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const models = [process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];
  let lastError;
  for (const model of [...new Set(models)]) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const response = await axios.post(url, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
      }, { timeout: 45000 });
      const answer = response.data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
      if (answer) return answer;
      lastError = new Error(`No response from ${model}`);
    } catch (error) { lastError = error; }
  }
  console.error('[Gemini] all models failed:', lastError?.response?.data || lastError?.message);
  return null;
}

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
  if (!text || message.key.fromMe) return;
  const data = read();
  const sender = message.key.participant || message.key.remoteJid;
  remember(chatId, text, sender);
  const mentionsSasuke = /\bsasuke\b/i.test(text);
  if (!mentionsSasuke && !data.autoreply) return;
  const history = getHistory(chatId).map(item => `${item.sender}: ${item.text}`).join('\n');
  const prompt = mentionsSasuke
    ? `You are SasukeX WhatsApp assistant. The user addressed you by saying Sasuke. Analyze the recent conversation and answer naturally, briefly and helpfully.\nRecent 25 messages:\n${history}\nCurrent message: ${text}`
    : `You are SasukeX WhatsApp auto-reply assistant. Reply naturally and briefly to this message.\nRecent context:\n${history}\nMessage: ${text}`;
  const answer = await generateGemini(prompt);
  if (answer) {
    remember(chatId, answer, 'sasukeX');
    await sock.sendMessage(chatId, { text: answer }, { quoted: message });
  } else if (mentionsSasuke && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    await sock.sendMessage(chatId, { text: '⚠️ Gemini API key configured nahi hai. Owner `.env` mein GEMINI_API_KEY set kare.' }, { quoted: message });
  }
}

async function aiCommand(sock, chatId, message, text) {
  const query = String(text || '').replace(/^\.ai\s*/i, '').trim();
  if (!query) return sock.sendMessage(chatId, { text: 'Usage: .ai <your question>' }, { quoted: message });
  const answer = await generateGemini(`You are SasukeX AI assistant. Answer clearly and concisely.\nUser: ${query}`);
  return sock.sendMessage(chatId, { text: answer || '❌ Gemini response failed. Check GEMINI_API_KEY and quota.' }, { quoted: message });
}

async function handlePresence(sock, message) {
  const data = read();
  if (data.autoseen) try { await sock.readMessages([message.key]); } catch (_) {}
  if (data.autoonline) try { await sock.sendPresenceUpdate('available', message.key.remoteJid); } catch (_) {}
}

module.exports = { read, save, toggle, handleAutoReply, handlePresence, aiCommand, generateGemini, remember };
