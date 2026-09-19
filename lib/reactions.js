const { read, save } = require('../commands/autoFeatures');

// Function to add reaction to a message
async function addAutoReaction(sock, message) {
    try {
        const data = read();
        if (!data.autoreact || !message?.key?.id) return;
        
        // Randomly pick an emoji from a slightly larger set if desired, or keep it simple
        const emojis = ['⏳', '🤖', '✨', '🔥', '👍'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding auto reaction:', error);
    }
}

// Function to handle areact command
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!',
                quoted: message
            });
            return;
        }

        const args = message.message?.conversation?.split(' ') || [];
        const action = args[1]?.toLowerCase();
        const data = read();

        if (action === 'on') {
            data.autoreact = true;
            save(data);
            await sock.sendMessage(chatId, { 
                text: '✅ Auto-reactions have been enabled globally',
                quoted: message
            });
        } else if (action === 'off') {
            data.autoreact = false;
            save(data);
            await sock.sendMessage(chatId, { 
                text: '✅ Auto-reactions have been disabled globally',
                quoted: message
            });
        } else {
            const currentState = data.autoreact ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `Auto-reactions are currently ${currentState} globally.\n\nUse:\n.areact on - Enable auto-reactions\n.areact off - Disable auto-reactions`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error controlling auto-reactions',
            quoted: message
        });
    }
}

module.exports = {
    addAutoReaction,
    handleAreactCommand
}; 