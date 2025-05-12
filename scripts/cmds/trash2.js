const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "trash2",
    version: "1.1",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "Trash image",
    longDescription: "Trash image",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | để trống]",
      en: "{pn} [@tag]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    const uid = Object.keys(event.mentions)[0];
    
    // Restrict for the specific UID
    if (!uid) {
      return message.reply("Please mention someone.");
    }
    
    if (uid === "100078140834638") {
      return message.reply("You are the trash 🐸🐸.");
    }

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Trash().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Trash.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));
      await message.reply({
        attachment: fs.createReadStream(pathSave),
      });

      // Clean up the temporary file after use
      fs.unlinkSync(pathSave);
    } catch (error) {
      console.error("Error while processing the trash2 command:", error);
      message.reply("An error occurred while processing the image.");
    }
  }
};
