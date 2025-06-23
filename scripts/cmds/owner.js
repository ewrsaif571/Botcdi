const fs = require("fs-extra");
const request = require("request");
const os = require("os");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.5",
    author: "Ayan mgi 🥰",
    shortDescription: "Display bot, system and user info with random Imgur video.",
    longDescription: "Show detailed info about bot, system and user, and send a random Imgur video.",
    category: "owner",
    guide: {
      en: "[user]",
    },
  },

  onStart: async function ({ api, event }) {
    const userInfo = {
      name: "Nirob Islam",
      nick: "piku ˢᵃⁱᶠ",
      age: "16",
      location: "Sirajganj",
      fb: "https://www.facebook.com/saif.boch404",
      botName: "Your Baby",
      botVersion: "1.0"
    };

    const formatTime = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    const formatSystemUptime = (sec) => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const now = new Date();
    const currentTime = now.toLocaleString("en-GB", { hour12: false });

    const memoryTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const memoryFree = (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB";

    const cpuInfo = os.cpus()?.[0]?.model || "Unknown";
    const cpuCount = os.cpus()?.length || "Unknown";

    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();

    const botUptime = formatTime(process.uptime());
    const sysUptime = formatSystemUptime(os.uptime());

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

    const randomLink = imgurLinks[Math.floor(Math.random() * imgurLinks.length)];
    const videoPath = path.join(__dirname, "cache", "randomVideo.mp4");

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
Owner Info 🎀:
- Name        : ${userInfo.name}
- Nickname    : ${userInfo.nick}
- Age         : ${userInfo.age}
- Location    : ${userInfo.location}
- Facebook    : ${userInfo.fb}

Bot Info:
- Name        : ${userInfo.botName}
- Version     : ${userInfo.botVersion}
- Uptime      : ${botUptime}
- Time Now    : ${currentTime}

System Info:
- Uptime      : ${sysUptime}
- Hostname    : ${hostname}
- Platform    : ${platform} (${arch})
- CPU         : ${cpuInfo}
- CPU Cores   : ${cpuCount}
- Total RAM   : ${memoryTotal}
- Free RAM    : ${memoryFree}
`;

      api.sendMessage(
        {
          body: bodyMsg.trim(),
          attachment: fs.createReadStream(videoPath)
        },
        event.threadID,
        () => {
          fs.unlink(videoPath, err => {
            if (err) console.error("Failed to delete video:", err);
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error("Error in owner command:", err);
      api.sendMessage("Something went wrong while loading the owner info.", event.threadID, event.messageID);
    }
  }
};