const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createReadStream } = require('fs');

const userDataFilePath = path.join(__dirname, 'ffquiz.json');

module.exports = {
  config: {
    name: "ffquiz",
    aliases: [],
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: "Guess the Free Fire character",
    longDescription: "Guess the Free Fire character based on the image",
    category: "game",
    guide: {
      en: "{p}ffquiz | {p}ffquiz top"
    }
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      if (!event || !message) return;

      const isAuthorValid = await this.checkAuthor(this.config.author);
      if (!isAuthorValid) {
        await message.reply("Author changer alert! This command belongs to Vex_Kshitiz.");
        return;
      }

      if (args.length === 1 && args[0] === "top") {
        return await this.showTopPlayers({ message });
      }

      const characterData = await this.fetchCharacterData();
      if (!characterData) {
        console.error("Error fetching character data");
        return message.reply("Error fetching character data. Please try again later.");
      }

      const { image, fullName, firstName } = characterData;
      const imageStream = await this.downloadImage(image);

      if (!imageStream) {
        console.error("Error downloading image");
        return message.reply("An error occurred while downloading the image. Please try again later.");
      }

      const replyMessage = {
        body: "Guess the ff character",
        attachment: imageStream
      };

      const sentMessage = await message.reply(replyMessage);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        correctAnswer: [fullName.toLowerCase(), firstName.toLowerCase()],
        senderID: event.senderID
      });

      setTimeout(async () => {
        await api.unsendMessage(sentMessage.messageID);
      }, 15000);

    } catch (error) {
      console.error("Error:", error);
      message.reply("An error occurred. Please try again later.");
    }
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    if (!event || !message || !Reply) return;
    const userAnswer = event.body.trim().toLowerCase();
    const correctAnswers = Reply.correctAnswer;

    if (correctAnswers.includes(userAnswer)) {
      await this.addCoins(Reply.senderID, 1000, usersData);
      await message.reply("🎉🎊 Congratulations! Your answer is correct. You have received 1000 coins.");
    } else {
      await message.reply(`🥺 Oops! Wrong answer. The correct answer was: ${correctAnswers[1]}`);
    }

    try {
      await message.unsend(event.messageID);
    } catch (error) {
      console.error("Error while unsending message:", error);
    }

    const { commandName, messageID } = Reply;
    if (commandName === this.config.name) {
      try {
        await message.unsend(messageID);
      } catch (error) {
        console.error("Error while unsending question:", error);
      }
    }
  },

  fetchCharacterData: async function () {
    try {
      const response = await axios.get('https://ff-quiz-kshitiz.vercel.app/kshitiz');
      return response.data;
    } catch (error) {
      console.error("Error fetching character data:", error);
      return null;
    }
  },

  downloadImage: async function (imageUrl) {
    try {
      const fileName = `ff_character.jpg`;
      const filePath = path.join(__dirname, 'cache', fileName);

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      if (!response.data || response.data.length === 0) {
        console.error("Empty image data received from the API.");
        return null;
      }

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, response.data, 'binary');

      return createReadStream(filePath);
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  },

  addCoins: async function (userID, amount, usersData) {
    try {
      let userData = await usersData.get(userID);
      if (!userData) {
        userData = { money: 0 };
      }
      userData.money += amount;
      await usersData.set(userID, userData);
    } catch (error) {
      console.error("Error adding coins:", error);
    }
  },

  showTopPlayers: async function ({ message }) {
    try {
      const allUserData = await this.getAllUserData();
      const userIDs = Object.keys(allUserData);
      const topUsers = [];

      for (const userID of userIDs) {
        const userData = allUserData[userID];
        topUsers.push({ userID, money: userData.money });
      }

      topUsers.sort((a, b) => b.money - a.money);
      const top5Users = topUsers.slice(0, 5);

      const topUsersString = top5Users.map((user, index) => `${index + 1}. User ID: ${user.userID}: ${user.money} coins`).join("\n");
      await message.reply(`Top 5 players:\n${topUsersString}`);
    } catch (error) {
      console.error("Error showing top players:", error);
      message.reply("An error occurred while fetching the top players. Please try again later.");
    }
  },

  getAllUserData: async function () {
    try {
      const data = await fs.readFile(userDataFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading user data:", error);
      return {};
    }
  },

  saveUserData: async function (userData) {
    try {
      await fs.writeFile(userDataFilePath, JSON.stringify(userData, null, 2), 'utf-8');
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  checkAuthor: async function (authorName) {
    try {
      const response = await axios.get('https://author-check.vercel.app/name');
      const apiAuthor = response.data.name;
      return apiAuthor === authorName;
    } catch (error) {
      console.error("Error checking author:", error);
      return false;
    }
  }
};
