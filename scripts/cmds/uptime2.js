module.exports = {
        config: {
                name: "uptime2",
                aliases: ["up2", "upt2"],
                version: "1.0",
                author: "Ullash ッ",
                role: 0,
                shortDescription: {
                        en: "Check the bot's uptime."
                },
                longDescription: {
                        en: "Shows how long the bot has been running."
                },
                category: "system",
                guide: {
                        en: "Use {p}uptime to check the bot's uptime."
                }
        },
        onStart: async function ({ api, event }) {
                const uptime = process.uptime();
                const seconds = Math.floor(uptime % 60);
                const minutes = Math.floor((uptime / 60) % 60);
                const hours = Math.floor((uptime / (60 * 60)) % 24);
                const days = Math.floor(uptime / (60 * 60 * 24));

                // uptime
                let uptimeString = "";
                if (days > 0) uptimeString += `➪ ${days} day${days > 1 ? "s" : ""}\n`;
                if (hours > 0) uptimeString += `➪ ${hours} hour${hours > 1 ? "s" : ""}\n`;
                if (minutes > 0) uptimeString += `➪ ${minutes} minute${minutes > 1 ? "s" : ""}\n`;
                uptimeString += `➪ ${seconds} second${seconds > 1 ? "s" : ""}`;

                // design 
                const message = `🎀🐥 𝗧𝘄𝗶𝗻𝗸𝗹𝗲 𝘂𝗽𝘁𝗶𝗺𝗲\n\n${uptimeString}\n\n\n\n`;

                api.sendMessage(message, event.threadID);
        }
};
