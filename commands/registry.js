/*
 * ꜱᴀꜱᴜᴋᴇX COMMAND REGISTRY
 * -------------------------
 * Future command add karne ke liye sirf correct section ki array mein line add karo.
 * Format: '.command <argument>'
 * Disabled commands ko registry mein add mat karo.
 */

const sections = {
  General: {
    icon: '◈',
    commands: ['.menu', '.showall', '.ai <question>', '.ping', '.alive', '.tts <text>', '.owner', '.joke', '.quote', '.weather <city>', '.attp <text>', '.trt <text> <lang>', '.ss <link>', '.url', '.dp', '.wow']
  },
  Admin: {
    icon: '♜',
    commands: ['.ban @user', '.unban @user', '.promote @user', '.demote @user', '.mute <minutes>', '.unmute', '.kick @user', '.warnings', '.warn @user', '.antilink', '.antibadword', '.tagall', '.tagnotadmin', '.hidetag <text>', '.welcome', '.goodbye', '.setgdesc', '.setgname', '.setgpp']
  },
  Owner: {
    icon: '♛',
    commands: ['.mode public/private', '.sessions', '.disconnect sessionN', '.makeowner <number>', '.antidelete', '.cleartmp', '.setpp', '.autoreact on/off', '.autoseen on/off', '.autoonline on/off', '.autoreply on/off', '.anticall on/off', '.pmblocker on/off']
  },
  Media: {
    icon: '✦',
    commands: ['.blur', '.simage', '.sticker', '.removebg', '.remini', '.crop', '.igs', '.igsc', '.meme', '.take']
  },
  Downloader: {
    icon: '⇩',
    commands: ['.play', '.song', '.spotify', '.instagram', '.facebook', '.tiktok', '.video']
  },
  Games: {
    icon: '◇',
    commands: ['.truth', '.dare']
  },
  Anime: {
    icon: '✿',
    commands: ['.anime <type>']
  },
  Misc: {
    icon: '✧',
    commands: ['.gay', '.heart', '.horny']
  },
  AI: {
    icon: '⌁',
    commands: ['(future AI commands)']
  }
};

// Commands intentionally disabled in this build. Keep this list documented.
const disabled = new Set([
  '.8ball', '.fact', '.news', '.groupinfo', '.infogp', '.infogrupo', '.lyrics', '.pies', '.china', '.indonesia', '.japan', '.korea', '.hijab',
  '.emojimix', '.emix', '.metallic', '.ice', '.snow', '.impressive', '.matrix', '.light', '.neon', '.devil', '.purple', '.thunder', '.leaves', '.1917', '.arena', '.hacker', '.sand', '.blackpink', '.glitch', '.fire',
  '.circle', '.lgbt', '.lolice', '.simpcard', '.its-so-stupid', '.namecard', '.oogway', '.oogway2', '.tweet', '.ytcomment', '.comrade', '.glass', '.jail', '.passed', '.triggered',
  '.compliment', '.insult', '.flirt', '.shayari', '.goodnight', '.roseday', '.character', '.wasted', '.ship', '.simp', '.stupid',
  '.git', '.github', '.sc', '.script', '.repo', '.gpt', '.gemini', '.imagine', '.flux', '.dalle', '.sora', '.vv'
]);

const allCommands = Object.values(sections).flatMap(section => section.commands).filter(command => command.startsWith('.')).map(command => command.split(' ')[0]);
const isDisabled = command => disabled.has(command);

function render(title = 'ꜱᴀꜱᴜᴋᴇX MENU') {
  const header = `╭━━━〔 ⚡ ${title} 〕━━━╮`;
  const body = Object.entries(sections).map(([name, section]) => {
    const lines = section.commands.map(command => `┃  ├─ ${command}`).join('\n');
    return `┃\n┃ ${section.icon} *${name.toUpperCase()}*\n${lines}`;
  }).join('\n');
  return `${header}\n${body}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
}

module.exports = { sections, allCommands, disabled, isDisabled, render };
