const login = require('fca-unofficial');
const fs = require('fs');

module.exports = async function () {
  const appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));

  const api = await new Promise((resolve, reject) => {
    login({ appState }, (err, api) => {
      if (err) return reject(err);
      resolve(api);
    });
  });

  api.setOptions({
    logLevel: "silent",
    listenEvents: true,
    selfListen: false
  });

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

  return api;
};
