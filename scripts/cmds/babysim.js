const axios = require("axios");

module.exports = {
  config: {
    name: 'nami',
    aliases: ["boa", "twinkle", "nami"],
    version: '3.0',
    author: 'RUBISH',
    countDown: 0,
    role: 0,
    description: {
      vi: '𝗖𝗵𝗮𝘁 𝘄𝗶𝘁𝗵 𝘀𝗶𝗺𝗺𝗮',
      en: '𝗖𝗵𝗮𝘁 𝘄𝗶𝘁𝗵 𝘀𝗶𝗺𝗺𝗮'
    },
    category: 'talk',
    guide: {
      vi: '   {pn} Hi  ',

      en: '   {pn} Hi '

    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.type == "message_reply") {
      const reply = event.body.toLowerCase();
      if (isNaN(reply)) {
        try {
          const response = await axios.get(`https://rubish-apihub.onrender.com/rubish//simma-chat?message=${encodeURIComponent(reply)}&apikey=rubish69`);
          const ok = response.data.response;
          await api.sendMessage(ok, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: 'reply',
              messageID: info.messageID,
              author: event.senderID,
              link: ok
            });
          }, event.messageID);
        } catch (error) {
          console.error(error);
        }
      }
    }
  },

  onStart: async function ({ api, args, event }) {
    try {
      const rubish = args.join(" ").toLowerCase();
      if (!args[0]) {
        api.sendMessage(
          "Bolo bby😘",
          event.threadID,
          event.messageID
        );
        return;
      }
      if (rubish) {
        const response = await axios.get(`https://rubish-apihub.onrender.com/rubish//simma-chat?message=${encodeURIComponent(rubish)}&apikey=rubish69`);
        const mg = response.data.response;
        await api.sendMessage({ body: mg }, event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: 'reply',
            messageID: info.messageID,
            author: event.senderID,
            link: mg
          });
        }, event.messageID);
      }
    } catch (error) {
      console.error(`Failed to get an answer: ${error.message}`);
      api.sendMessage(`${error.message}.\nAn error`, event.threadID, event.messageID);
    }
  }
};
