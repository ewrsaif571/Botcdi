const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anya",
    aliases: [],
    author: "kshitiz",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: "Chat with Anya forger"
    },
    category: "ai",
    guide: {
      en: "{p}{n} [text]"
    }
  },
  onStart: async function ({ api, event, args, message }) {
    try {
      const { createReadStream, unlinkSync } = fs;
      const { resolve } = path;
      const { messageID, threadID, senderID } = event;

      const getUserInfo = async (api, userID) => {
        try {
          const userInfo = await api.getUserInfo(userID);
          return userInfo[userID].firstName;
        } catch (error) {
          console.error(`Error fetching user info: ${error}`);
          return '';
        }
      };

      const [a, b, c, d] = ["Konichiwa", "senpai", "Hora"];

      const k = await getUserInfo(api, senderID);
      const ranGreet = `${a} ${k} ${b}`;

      const chat = args.join(" ");

      if (!args[0]) return message.reply(ranGreet);

      const tranChat = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(chat)}`);

      const l = tranChat.data[0][0][0];

      const m = resolve(__dirname, 'cache', `${threadID}_${senderID}.wav`);

      const n = await axios.get(`https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(l)}&speaker=3&fbclid=IwAR01Y4UydrYh7kvt0wxmExdzoFTL30VkXsLZZ2HjXjDklJsYy2UR3b9uiHA`);

      const o = n.data.mp3StreamingUrl;

      await global.utils.downloadFile(o, m);

      const p = createReadStream(m);

      message.reply({
        body: l,
        attachment: p
      }, threadID, () => unlinkSync(m));
    } catch (error) {
      console.error(error);
      message.reply("error");
    }
  }
};
