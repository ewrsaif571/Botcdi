const axios = require("axios");

module.exports = {
  config: {
    name: "saxx",
    aliases: [], // add your aliases
    version: "1.0",
    author: "Mesbah Saxx",
    countDown: 5,
    role: 0,
    description: {
      en: "Teach and chat with the bot."
    },
    category: "chat",
    guide: {
      en: "   {pn} teach <question> - <answer, answer2>"
        + "\n   {pn} <question>"
    }
  },

  onStart: async function ({ message, event, args, commandName }) {
    const senderID = event.senderID;

    if (args[0] === "teach") {
      const input = args.slice(1).join(" ").split(" - ");
      if (input.length !== 2) return message.reply("❌ Usage: /sim teach <question> - <answers>");

      const [question, answers] = input;
      const answersArray = answers.split(",").map(a => a.trim());

      try {
        await axios.post("https://www.mesbah-saxx.is-best.net/api/sim/teach", {
          question,
          answer: answersArray,
          senderID
        });
        message.reply(`✅ Taught: "${question}" → "${answersArray.join(", ")}"`);
      } catch (error) {
        message.reply(`❌ Failed to teach the bot.\n\nError: ${error.response?.data || error.message}`);
      }
      return;
    }

    const question = args.join(" ");
    if (!question) return message.reply("❌ Please provide a question.");

    try {
      const { data } = await axios.get(`https://www.mesbah-saxx.is-best.net/api/sim/get?question=${encodeURIComponent(question)}&senderID=${senderID}`);
      message.reply(data.response, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID
        });
      });
    } catch (error) {
      message.reply("❌ Error retrieving response.");
    }
  },

  onChat: async function ({ message, event, args, commandName }) {
    if (!event.body) return;

    const botCommand = args[0]?.toLowerCase();
    const botQuery = args.slice(1).join(" ");

    const validCommands = [this.config.name, ...this.config.aliases];
    if (!validCommands.includes(botCommand)) return;

    if (!botQuery) return message.reply("❌ Please provide a question.");

    const senderID = event.senderID;

    if (args[0] === "teach") {
      const input = args.slice(1).join(" ").split(" - ");
      if (input.length !== 2) return message.reply("❌ Usage: /sim teach <question> - <answers>");

      const [question, answers] = input;
      const answersArray = answers.split(",").map(a => a.trim());

      await axios.post("https://www.mesbah-saxx.is-best.net/api/sim/teach", {
        question,
        answer: answersArray,
        senderID
      });

      message.reply(`✅ Taught: "${question}" → "${answersArray.join(", ")}"`);
      return;
    }

    const question = args.join(" ");
    if (!question) return message.reply("❌ Please provide a question.");

    const { data } = await axios.get(`https://www.mesbah-saxx.is-best.net/api/sim/get?question=${encodeURIComponent(question)}&senderID=${senderID}`);
    
    message.reply(data.response, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID
      });
    });
  },

  onReply: async function ({ message, event, commandName, Reply }) {
    const { senderID, body } = event;
    const { author } = Reply;

    if (senderID !== author) return message.reaction("❌", event.messageID);

    try {
      const { data } = await axios.get(`https://www.mesbah-saxx.is-best.net/api/sim/get?question=${encodeURIComponent(body)}&senderID=${senderID}`);
      message.reply(data.response, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID
        });
      });
    } catch (error) {
      message.reply("❌ Error retrieving response.");
    }
  },
};
