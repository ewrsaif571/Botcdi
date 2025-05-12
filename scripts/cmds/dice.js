module.exports = {
  config: {
    name: "dice",
    aliases: [],
    version: "1.3",
    author: "kshitiz (enhanced by SAIF 🐣)",
    countDown: 5,
    role: 0,
    shortDescription: "🎲 Dice Game - Roll & Win!",
    longDescription: {
      en: "Bet on a dice number and test your luck. Win double if you're right!",
    },
    category: "game",
    guide: {
      en: "{p}dice <number 1-6> <bet amount>\n\nExample: {p}dice 3 1000",
    },
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const user = event.senderID;
    const userData = await usersData.get(user);

    // User Input Validation
    const dice = parseInt(args[0]);
    const betAmount = parseInt(args[1]);

    if (isNaN(dice) || dice < 1 || dice > 6) {
      return message.reply(
        `🎲 𝗗𝗜𝗖𝗘 𝗚𝗔𝗠𝗘\n` +
        `❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗖𝗵𝗼𝗶𝗰𝗲!\n` +
        `🎲 𝗣𝗶𝗰𝗸 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿 𝟭-𝟲\n` +
        `📝 𝗨𝘀𝗮𝗴𝗲: ${p}dice <num> <bet>\n` +
        `🔹 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: ${p}dice 3 1000`
      );
    }
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(
        `🎲 𝗗𝗜𝗖𝗘 𝗚𝗔𝗠𝗘\n` +
        `❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗕𝗲𝘁 𝗔𝗺𝗺𝗼𝘂𝗻𝘁!\n` +
        `💰 𝗘𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗺𝗯𝗲𝗿\n` +
        `📝 𝗨𝘀𝗮𝗴𝗲: ${p}dice <num> <bet>\n` +
        `🔹 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: ${p}dice 3 1000`
      );
    }

    // Check if user has enough balance
    if (userData.money < betAmount) {
      return message.reply(
        `🎲 𝗗𝗜𝗖𝗘 𝗚𝗔𝗠𝗘\n` +
        `🥲 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗕𝗮𝗹𝗮𝗻𝗰𝗲!\n` +
        `💰 𝗬𝗼𝘂𝗿 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${userData.money}`
      );
    }

    // Roll the dice (1 to 6)
    const rolledNumber = Math.floor(Math.random() * 6) + 1;
    let resultText = `🎲 𝗗𝗜𝗖𝗘 𝗥𝗼𝗹𝗹𝗲𝗱 ${rolledNumber}\n`;

    if (rolledNumber === dice) {
      const winAmount = betAmount * 2;
      userData.money += winAmount;
      resultText += `🎀 𝗬𝗼𝘂 𝗪𝗼𝗻 +${winAmount} 𝗖𝗼𝗶𝗻𝘀\n`;
    } else {
      userData.money -= betAmount;
      resultText += `🥺 𝗬𝗼𝘂 𝗟𝗼𝘀𝘁 -${betAmount} 𝗖𝗼𝗶𝗻𝘀\n`;
    }

    // Update user balance
    await usersData.set(user, userData);

    // Send final message
    message.reply(resultText);
  }
};
