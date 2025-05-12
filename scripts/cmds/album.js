const axios = require("axios");
const tinyurl = require("tinyurl");

const hasan = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/KingsOfToxiciter/alldl/refs/heads/main/toxicitieslordhasan.json`);
  return base.data.api;
};

module.exports = {
  config: {
    name: "album",
    aliases: [],
    version: "2.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    countDown: 2,
    role: 0,
    description: {
      en: "Upload video to category or get video by category",
    },
    category: "media",
    guide: {
      en: "{pn} => List of available video categories\n{pn} add [category] => upload video to that category\n{pn} list => to see the available category to add videos",
    },
  },

  onStart: async function ({ api, args, event, commandName }) {

    if (args[0] === "list") {
      const { data } = await axios.get(`${await hasan()}/album/list?categoryList=hasan`);
      const list = data.category;
      let msg = "🖇️ 𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘 𝐓𝐎 𝐀𝐃𝐃 𝐕𝐈𝐃𝐄𝐎𝐒 🖇️\n\n";
      list.forEach((cat, index) => {
        msg += `${index + 1}. ${cat}\n`;
      });
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (args[0] === "add") {
      const category = args.slice(1).join(" ").trim().toLowerCase();

      const originalUrl = event.messageReply?.attachments[0]?.url;
      if (!originalUrl) {
        return api.sendMessage("❌ | Please reply to a video to upload.", event.threadID, event.messageID);
      }

      try {
        const videoUrl = await tinyurl.shorten(originalUrl);
        const upload = await axios.get(`${await hasan()}/album/upload?category=${encodeURIComponent(category)}&link=${encodeURIComponent(videoUrl)}`);
        return api.sendMessage(upload.data.message, event.threadID, event.messageID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ | Failed to upload.", event.threadID, event.messageID);
      }
    }

    try {
      const { data } = await axios.get(`${await hasan()}/album/list?categoryList=hasan`);
      const category = data.availableCategory;
      let msg = `🔖 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬 ✨\n\n`;
      category.forEach((cat, index) => {
        msg += `${index + 1}. ${cat}\n`;
      });
      msg += `\n➡️ 𝘙𝘦𝘱𝘭𝘺 𝘵𝘩𝘪𝘴 𝘮𝘦𝘴𝘴𝘢𝘨𝘦 𝘸𝘪𝘵𝘩 𝘢 𝘯𝘶𝘮𝘣𝘦𝘳 𝘰𝘧 𝘵𝘩𝘦 𝘭𝘪𝘴𝘵 𝘵𝘰 𝘨𝘦𝘵 𝘵𝘩𝘢𝘵 𝘤𝘢𝘵𝘦𝘨𝘰𝘳𝘪𝘦𝘴 𝘷𝘪𝘥𝘦𝘰`;

      api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          categories: category 
        });
      }, event.messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | Failed to fetch categories.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply }) {
    const { categories } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > categories.length) {
      return api.sendMessage("❌ | Invalid number. Please reply with a valid number from the list.", event.threadID, event.messageID);
    }

    const selectedCategory = categories[choice - 1];

    try {
      const { data } = await axios.get(`${await hasan()}/album?category=${encodeURIComponent(selectedCategory)}`);
      const link = data.video.link;

      await api.unsendMessage(Reply.messageID);

      return api.sendMessage({
        body: `🦋 | New bby ${selectedCategory} video <😽>`,
        attachment: await global.utils.getStreamFromURL(link)
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(`❌ | Error fetching video.\n${err.message}`, event.threadID, event.messageID);
    }
  }
};