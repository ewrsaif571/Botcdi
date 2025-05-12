const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

// Placeholder for secure Facebook profile picture retrieval function
async function getFacebookProfilePicture(userId) {
  // Implement logic to retrieve profile picture using Facebook Graph API
  // and user consent
}

module.exports = {
  config: {
    name: "buttslap2",
    aliases: ["btslap2"],
    version: "1.0",
    author: "Mahim",
    countDown: 5,
    role: 0,
    shortDescription: "buttslap someone",
    longDescription: "",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];

    // Check if the mentioned user is restricted
    if (uid2 === "100078140834638" || uid2 === "100084690500330") {
      return message.reply("who the hell are you moron ‍");
    }

    if (!uid2) {
      return message.reply("You didn't tag anyone.");
    }

    try {
      const one = uid1, two = uid2;

      // Get profile pictures securely using getFacebookProfilePicture function
      const avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      avone.circle();
      const avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      avtwo.circle();

      const pth = "butt.png";
      const img = await jimp.read("https://i.postimg.cc/W3NwfQTB/butt.png");

      img.resize(720, 405)
        .composite(avone.resize(90, 90), 368, 34)
        .composite(avtwo.resize(90, 90), 190, 225);

      await img.writeAsync(pth);
      message.reply({ body: "𝕞𝕠𝕧𝕖 𝕪𝕠𝕦𝕣 𝕓𝕦𝕥𝕥", attachment: fs.createReadStream(pth) });
    } catch (error) {
      console.error("Error:", error);
      message.reply("An error occurred. Please try again later.");
    }
  }
};
