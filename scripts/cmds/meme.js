const axios = require("axios");

module.exports = {
  config: {
    name: "meme",
    version: "1.0",
    author: "null",
    shortDescription: "Send a random meme",
    category: "fun"
  },

  onStart: async function({ api, event }) {
    try {
      const apis = [
        "https://meme-api.com/gimme",
        "https://some-random-api.ml/meme",
        "https://api.imgflip.com/get_memes"
      ];

      const apiUrl = apis[Math.floor(Math.random() * apis.length)];

      let memeUrl = "";

      if (apiUrl.includes("imgflip")) {
        const res = await axios.get(apiUrl);
        const memes = res.data.data.memes;
        const meme = memes[Math.floor(Math.random() * memes.length)];
        memeUrl = meme.url;
      } else {
        const res = await axios.get(apiUrl);
        memeUrl = res.data.url || res.data.image || res.data.meme || res.data.memes;
      }

      if (!memeUrl) return api.sendMessage("❌ Could not fetch meme.", event.threadID);

      api.sendMessage({ body: "Here's a meme for you🐥", attachment: await global.utils.getStreamFromURL(memeUrl) }, event.threadID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Error fetching meme, try again later.", event.threadID);
    }
  }
};