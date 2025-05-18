const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "poli",
    version: "3.0",
    author: "SAIF",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI image ",
    longDescription: "Create beautiful images directly using prompt",
    category: "image",
    guide: {
      en: "{pn} [your prompt]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❗ দয়া করে একটি প্রম্পট লিখুন।\nউদাহরণ: !flux a goat in anime style", event.threadID, event.messageID);
    }

    const loading = await api.sendMessage("⏳ ছবি তৈরি হচ্ছে, একটু অপেক্ষা করুন...", event.threadID);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    const imagePath = path.join(__dirname, "flux.jpg");

    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, response.data);

      api.sendMessage({
        body: `✅Hare you're generated image!!"${prompt}"`,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => {
        fs.unlinkSync(imagePath); // delete temp file
        api.unsendMessage(loading.messageID);
      });
    } catch (err) {
      console.error("Image download failed:", err.message);
      api.sendMessage("tatah 😔🦵", event.threadID, event.messageID);
    }
  }
};