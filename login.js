const login = require('fca-unofficial');
const fs = require('fs');
const path = require('path');

module.exports = async function () {
  const appStatePath = path.join(__dirname, 'appstate.json');

  if (!fs.existsSync(appStatePath)) {
    throw new Error('❌ appstate.json not found in login folder!');
  }

  const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));

  const api = await new Promise((resolve, reject) => {
    login({ appState }, (err, api) => {
      if (err) return reject(err);
      resolve(api);
    });
  });

  // Optional basic config
  api.setOptions({
    logLevel: "silent",
    listenEvents: true,
    selfListen: false,
    updatePresence: true,
    forceLogin: true
  });

  // ✅ FIX: Add fallback editMessage method if not exists
  if (typeof api.editMessage !== "function") {
    api.editMessage = async (message, messageID, threadID) => {
      try {
        await api.unsendMessage(messageID);
        await api.sendMessage(message, threadID);
      } catch (e) {
        console.log("editMessage fallback failed:", e.message);
      }
    };
  }

  console.log("✅ Login successful!");
  return api;
};