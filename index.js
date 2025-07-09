// index.js

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { getGreeting, getCurrentTime } = require('./lib/functions');
const config = require('./config/config');

const fs = require('fs');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./session/session.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log(`✅ Bot Connected as: ${sock.user.name}`);
    }
  });

  // 🔥 MESSAGE HANDLER
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    const prefix = config.prefix.find(p => body.startsWith(p));
    if (!prefix) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Sample command
    if (command === 'alive') {
      const greeting = getGreeting();
      await sock.sendMessage(from, { text: `🤖 *${config.botName} is Online!*\n\n${greeting}\n⏰ Time: ${getCurrentTime()}` });
    }

    if (command === 'channel') {
      await sock.sendMessage(from, {
        text: `📢 Join our WhatsApp Channel:\n${'https://whatsapp.com/channel/0029Vb6YHYNFSAt4222Nl51I'}`
      });
    }
  });
}

startBot();
