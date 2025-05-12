const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "info2",
    version: "1.1",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "info",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    if (event.body) {
      let text = event.body.toLowerCase();

      if (text === "Sinfo" || text === "twinkle") {
        try {
          // Video URL
          const videoUrl = "https://i.imgur.com/KV1u6yV.mp4";
          const path = __dirname + "/temp_video.mp4";

          // Download Video
          let response = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
          });

          response.data.pipe(fs.createWriteStream(path));
          response.data.on("end", async () => {
            return message.reply({
              body: `╔════════════╗\n║  Twinkle info ║\n╚════════════╝\n\n 𝐎𝐰𝐧𝐞𝐫: 𝗦𝗔𝗜𝗙\n 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: 𝗧𝘄𝗶𝗻𝗸𝗹𝗲 ✨\n : \n\n 𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 ❤️`,
              attachment: fs.createReadStream(path),
            });
          });
        } catch (error) {
          console.error("Video Download Error:", error);
          return message.reply("⚠️ Video download korte problem hoise!");
        }
      }
    }
  },
};
