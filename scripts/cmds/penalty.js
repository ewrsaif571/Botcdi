const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const cacheDir = path.join(__dirname, 'cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const initialImageUrl = 'https://i.ibb.co/gmKRSrJ/Screenshot-208.png';
const savedImageUrl = 'https://i.ibb.co/JtsPh4R/Screenshot-205.png';
const missedImageUrl = 'https://i.ibb.co/7rQyN4y/Screenshot-206.png';
const successImageUrl = 'https://i.ibb.co/S6y5CKC/Screenshot-210.png';

module.exports = {
  config: {
    name: "penalty",
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: "Football penalty shooting game",
    longDescription: "Football penalty shooting game",
    category: "game",
    guide: {
      en: "{p}penalty {bet}"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    try {
      if (args.length !== 1 || isNaN(parseInt(args[0]))) {
        return message.reply("Please provide a valid bet amount.");
      }

      const betAmount = parseInt(args[0]);
      const senderID = event.senderID;
      const userData = await usersData.get(senderID);

      if (betAmount > userData.money) {
        return message.reply("You don't have enough money to place this bet.");
      }

      const initialImage = await loadImage(initialImageUrl);
      const imagePath = await saveImageToCache(initialImage);
      const sentMessage = await message.reply({ attachment: fs.createReadStream(imagePath) });

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "penalty",
        uid: senderID,
        bet: betAmount,
        result: null
      });

    } catch (error) {
      console.error("Error in penalty command:", error);
      message.reply("An error occurred. Please try again.");
    }
  },

  onReply: async function ({ api, message, event, args, usersData }) {
    const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);

    if (!replyData || replyData.uid !== event.senderID) return;

    const { commandName, uid, bet } = replyData;
    if (commandName !== "penalty") return;

    const userData = await usersData.get(uid);

    if (["left", "right", "middle", "left corner", "right corner"].includes(args[0])) {
      const shotDirection = args[0];
      const goalChance = Math.random();

      let isGoal = false;
      if (shotDirection === "left" || shotDirection === "right") {
        isGoal = goalChance < 0.5;
      } else if (shotDirection === "middle") {
        isGoal = goalChance < 0.7;
      } else if (shotDirection === "left corner" || shotDirection === "right corner") {
        isGoal = goalChance < 0.4;
      }

      let resultImage;
      let resultMessage;
      if (isGoal) {
        resultImage = await loadImage(successImageUrl);
        resultMessage = `Goal! You won ${bet * 2} coins.`;
        await usersData.set(uid, { money: userData.money + bet });
      } else if (goalChance < 0.1) {
        resultImage = await loadImage(savedImageUrl);
        resultMessage = `Saved by the keeper! You lost ${bet} coins.`;
        await usersData.set(uid, { money: userData.money - bet });
      } else {
        resultImage = await loadImage(missedImageUrl);
        resultMessage = `Missed! You lost ${bet} coins.`;
        await usersData.set(uid, { money: userData.money - bet });
      }

      const imagePath = await saveImageToCache(resultImage);
      await message.reply({ attachment: fs.createReadStream(imagePath) });
      await message.reply(resultMessage);

      global.GoatBot.onReply.delete(event.messageReply.messageID);
    } else {
      message.reply("Invalid command. Use 'left', 'right', 'middle', 'left corner', or 'right corner' to shoot the ball.");
    }
  }
};

async function saveImageToCache(image) {
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const imagePath = path.join(cacheDir, `penalty_${Date.now()}.png`);
  await fs.promises.writeFile(imagePath, canvas.toBuffer());
  return imagePath;
}