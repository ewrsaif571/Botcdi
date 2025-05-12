const axios = require("axios");

module.exports.config = {
    name: "expend",
    aliases: [],
    version: "1.0",
    author: "𝐻𝐴𝑆𝐴𝑁 🥰",
    countDown: 3, 
    role: 0,
    longDescription: {
        en: "expend your images"
    },
    category: "tool",
    guide: {
        en: "{pn} reply to an image for expended"
    } 
};

module.exports.onStart = async ({ api, event, args }) => {
    try {
      const ratio = args.join(" ") || "1:1";
        if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
            return api.sendMessage("𝘗𝘭𝘦𝘢𝘴𝘦 𝘳𝘦𝘱𝘭𝘺 𝘵𝘰 𝘢𝘯 𝘪𝘮𝘢𝘨𝘦 𝘸𝘪𝘵𝘩 𝘵𝘩𝘪𝘴 𝘤𝘮𝘥.", event.threadID, event.messageID);
        }

        const hasan = event.messageReply.attachments[0].url;
        const baigan = "https://hasan-all-apis.onrender.com";
        const apiUrl = `${baigan}/expend?imageUrl=${encodeURIComponent(hasan)}&ratio=${ratio}`;

        const response = await axios.get(apiUrl, {
            responseType: 'stream'
        });

        api.sendMessage({
            body: "𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐞𝐱𝐩𝐞𝐧𝐝𝐞𝐝 𝐢𝐦𝐚𝐠𝐞",
            attachment: response.data
        }, event.threadID, event.messageID);

    } catch (e) {
        api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
    }
};