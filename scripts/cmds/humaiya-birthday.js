module.exports = {
    config: {
        name: "humaiya-birthday",
        version: "1.0",
        author: "Samir",
        aliases: ["bday2"],
        countDown: 5,
        role: 0,
        category: "birthday🎀",
        shortDescription: "See Admin's Birthday",
        longDescription: "Admin Birthday Countdowns",
        guide: {
            vi: "{p}{n}",
            en: "{p}{n}"
        }
    },

    onStart: async function ({ event, api }) {
        const today = new Date();
        let targetYear = today.getFullYear(); // বর্তমান বছর সেট করছি

        const targetDate = new Date(`${targetYear}-02-25 00:00:00`).getTime();
        if (today.getTime() > targetDate) {
            targetYear += 1; 
        }

        const finalTargetDate = new Date(`${targetYear}-02-25 00:00:00`).getTime();
        const now = new Date().getTime();
        const t = finalTargetDate - now;

        if (t <= 0) {
            return api.sendMessage("🎉🎂 Happy Birthday Humaiya SAIF er future wife!!🌚🍼", event.threadID, event.messageID);
        }

        const seconds = Math.floor((t / 1000) % 60);
        const minutes = Math.floor((t / 1000 / 60) % 60);
        const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        const days = Math.floor(t / (1000 * 60 * 60 * 24));

        const countdownMessage = `
🦋❤️‍🩹 𝗛𝘂𝗺𝗮𝗶𝘆𝗮 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆_✿︎
━━━━━━━━━━━━━━━━━━━━━━
🌙 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆 𝗗𝗮𝘁𝗲: 25th February, ${targetYear}
📅 𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁: 
» ${days} days  
» ${hours} hours  
» ${minutes} minutes  
» ${seconds} seconds
━━━━━━━━━━━━━━━━━━━━━━`;

        return api.sendMessage(countdownMessage, event.threadID, event.messageID);
    }
};
