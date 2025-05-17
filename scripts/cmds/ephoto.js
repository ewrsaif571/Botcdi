const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ephoto",
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    countDown: 5,
    shortDescription: {
      en: "all in one maker"
    },
    category: "image",
    guide: {
      en: "{prefix}ephoto <text> -<number>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    async function checkAuthor(authorName) {
      try {
        const response = await axios.get('https://author-check.vercel.app/name');
        const apiAuthor = response.data.name;
        return apiAuthor === authorName;
      } catch (error) {
        console.error("Error checking author:", error);
        return false;
      }
    }
    const isAuthorValid = await checkAuthor(module.exports.config.author);
    if (!isAuthorValid) {
      await message.reply("Author changer alert! This command belongs to Vex_Kshitiz.");
      return;
    }

    try {
      const searchQuery = args.join(" ");
      if (!searchQuery.includes("-")) {
        return api.sendMessage(`Invalid format. Example: {p}ephoto vex kshitiz -1`, event.threadID, event.messageID);
      }
      const [text, num] = searchQuery.split("-").map(str => str.trim());
      const number = parseInt(num);

     
      if (isNaN(number) || number <= 0 || number > 1000) {
        return api.sendMessage("Please specify a number like 1 2 3 etc.", event.threadID, event.messageID);
      }

   
      const apiUrl = `https://e-photo.vercel.app/kshitiz?text=${encodeURIComponent(text)}&number=${number}`;
      const response = await axios.get(apiUrl);
      const imageData = response.data.result;

      
      if (!imageData || !imageData.status || !imageData.ing) {
        return api.sendMessage(`No e-photo found for "${text}".`, event.threadID, event.messageID);
      }

  
      const imageUrl = imageData.ing;

      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

     
      const imgPath = path.join(__dirname, 'cache', `ephoto.jpg`);
      await fs.outputFile(imgPath, imgResponse.data);
 
      const stream = fs.createReadStream(imgPath);
      await api.sendMessage({
        attachment: stream,
        body: ''
      }, event.threadID, event.messageID);
      await fs.unlink(imgPath);
    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred.`, event.threadID, event.messageID);
    }
  }
};