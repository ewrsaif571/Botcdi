const fs = require("fs-extra");
const request = require("request");
const os = require("os");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    version: "1.4",
    author: "Ayan mgi 🥰",
    shortDescription: "Display bot and user info with uptime and random Imgur video.",
    longDescription: "Show detailed info about the bot and the user, with uptime and send random Imgur video.",
    category: "info",
    guide: {
      en: "[user]",
    },
  },

  onStart: async function ({ api, event, args }) {
    // User Information
    const userInfo = {
      name: "SAIF ISLAM",
      age: "15+",
      location: "Sirajganj",
      bio: "Bot & JavaScript Lover | Idk 🙂",
      botName: "Twinkle 🎀",
      botVersion: "1.0",
    };

    // Bot Uptime
    const botUptime = process.uptime();
    const botHours = Math.floor(botUptime / 3600);
    const botMinutes = Math.floor((botUptime % 3600) / 60);
    const botSeconds = Math.floor(botUptime % 60);
    const formattedBotUptime = `${botHours}h ${botMinutes}m ${botSeconds}s`;

    // System Uptime
    const systemUptime = os.uptime();
    const sysDays = Math.floor(systemUptime / (3600 * 24));
    const sysHours = Math.floor((systemUptime % (3600 * 24)) / 3600);
    const sysMinutes = Math.floor((systemUptime % 3600) / 60);
    const sysSeconds = Math.floor(systemUptime % 60);
    const formattedSystemUptime = `${sysDays}d ${sysHours}h ${sysMinutes}m ${sysSeconds}s`;

    // Imgur Video Links
    const imgurLinks = [
      "https://i.imgur.com/DfTQ5i6.mp4",
      "https://i.imgur.com/R4iAMnn.mp4",
      "https://i.imgur.com/9MoSlTY.mp4",
      "https://i.imgur.com/UiTaUXv.mp4",
      "https://i.imgur.com/CJsIzBc.mp4",
      "https://i.imgur.com/iJOz5pv.mp4",
      "https://i.imgur.com/ayCtv8c.mp4",
      "https://i.imgur.com/dTFkLfO.mp4",
      "https://i.imgur.com/Ov9Iq7A.mp4",
    ];

    // Pick a random video
    const randomLink = imgurLinks[Math.floor(Math.random() * imgurLinks.length)];
    const videoPath = path.join(__dirname, "/cache/randomVideo.mp4");

    // Download the random video
    const downloadVideo = (url, filePath) => {
      return new Promise((resolve, reject) => {
        request(url)
          .pipe(fs.createWriteStream(filePath))
          .on("close", resolve)
          .on("error", reject);
      });
    };

    try {
      await downloadVideo(randomLink, videoPath);

      const bodyMsg = `
Information: 🥷

- Name: ${userInfo.name}
- Age: ${userInfo.age}
- Location: ${userInfo.location}
- Bio: ${userInfo.bio}

Bot Details:

- Bot Name: ${userInfo.botName}
- Bot Version: ${userInfo.botVersion}
- Bot Uptime: ${formattedBotUptime}

System Uptime:

- ${formattedSystemUptime}

─────────────────────
`;

      api.sendMessage(
        {
          body: bodyMsg,
          attachment: fs.createReadStream(videoPath),
        },
        event.threadID,
        () => {
          // Delete the downloaded video after sending
          fs.unlinkSync(videoPath);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
    }
  },
};