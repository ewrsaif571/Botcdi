const os = require("os");
const fs = require("fs-extra");

const startTime = new Date(); // Moved outside onStart

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    author: "ArYAN",
    countDown: 0,
    role: 0,
    category: "system",
    longDescription: {
      en: "Get System Information",
    },
  },
  
  onStart: async function ({ api, event, args, threadsData, usersData }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;

      const seconds = uptimeInSeconds;
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secondsLeft = Math.floor(seconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const loadAverage = os.loadavg();
      const cpuUsage =
        os
          .cpus()
          .map((cpu) => cpu.times.user)
          .reduce((acc, curr) => acc + curr) / os.cpus().length;

      const totalMemoryGB = os.totalmem() / 1024 ** 3;
      const freeMemoryGB = os.freemem() / 1024 ** 3;
      const usedMemoryGB = totalMemoryGB - freeMemoryGB;

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const currentDate = new Date();
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      const date = currentDate.toLocaleDateString("en-US", options);
      const time = currentDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      });

      const timeStart = Date.now();
      await api.sendMessage({
        body: "🔎| checking........",
      }, event.threadID);

      const ping = Date.now() - timeStart;

      let pingStatus = "⛔| 𝖡𝖺𝖽 𝖲𝗒𝗌𝗍𝖾𝗆";
      if (ping < 1000) {
        pingStatus = "✅| 𝖲𝗆𝗈𝗈𝗍𝗁 𝖲𝗒𝗌𝗍𝖾𝗆";
      }
      const systemInfo = `♡   ∩_∩
 （„• ֊ •„)♡
╭─∪∪────────────⟡
│ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
├───────────────⟡
│ ⏰ 𝗥𝗨𝗡𝗧𝗜𝗠𝗘
│  ${uptimeFormatted}
├───────────────⟡
│ ✅ 𝗢𝗧𝗛𝗘𝗥 𝗜𝗡𝗙𝗢
│𝙳𝙰𝚃𝙴: ${date}
│𝚃𝙸𝙼𝙴: ${time}
│𝚄𝚂𝙴𝚁𝚂: ${allUsers.length}
│𝚃𝙷𝚁𝙴𝙰𝙳𝚂: ${allThreads.length}
│𝙿𝙸𝙽𝙶: ${ping}𝚖𝚜
│𝚂𝚃𝙰𝚃𝚄𝚂: ${pingStatus}
├───────────────⟡
│  🙂𝗢𝗪𝗡𝗘𝗥 
│𝙽𝚊𝚖𝚎 : Sᴀɪғ 🧸 
│𝚂𝙸𝙽𝙶𝙻𝙴 𝚄𝙻𝚃𝚁𝙰 𝙿𝚁𝙾 𝙼𝙰𝚇
╰───────────────⟡
`;

      api.sendMessage(
        {
          body: systemInfo,
        },
        event.threadID,
        (err, messageInfo) => {
          if (err) {
            console.error("Error sending message with attachment:", err);
          } else {
            console.log(
              "Message with attachment sent successfully:",
              messageInfo,
            );
          }
        },
      );
    } catch (error) {
      console.error("Error retrieving system information:", error);
      api.sendMessage(
        "Unable to retrieve system information.",
        event.threadID,
        event.messageID,
      );
    }
  },
};
