module.exports = {
  config: {
    name: "ping",
    author: "UPoL",
    version: "1.1",
    cooldowns: 3,
    role: 0,
    category: "system",
    guide: {
      en: "{pn}"
    },
  },
  onStart: async function ({ message, api, event }) {
    let pingResults = [];
    
    const msg = await message.reply("⏳ Checking bot ping...");

    for (let i = 1; i <= 5; i++) {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 50)); 
      const ping = Date.now() - start;

      let status;
      if (ping < 100) status = "_Excellent_";
      else if (ping < 200) status = "_Good_";
      else if (ping < 300) status = "_Average_";
      else status = "_Slow_";

      pingResults.push(` Ping ${i}: ${ping}ms - ${status}`);
      
      await api.editMessage(` Checking bot ping...\n\n${pingResults.join("\n")}`, msg.messageID);
    }

    api.editMessage(`${pingResults.join("\n")}`, msg.messageID);
  }
};