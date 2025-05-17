const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const shipImageUrl = 'https://i.ibb.co/pX8rTWZ/download-27-removebg-preview.png'; 

module.exports = {
  config: {
    name: "goingmerry",
    aliases: ["gm"],
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: "Play the classic going merry game",
    longDescription: "Try to find all three going merry hidden in the 9-grid board with 6 guesses.",
    category: "game",
    guide: {
      en: "{p}gm"
    }
  },

  onStart: async function ({ api, message, event, usersData, args }) {
    try {
      const senderID = event.senderID;
      const userData = await usersData.get(senderID);


      const betAmount = 500;
      if (userData.money < betAmount) {
        return message.reply("you need 500 coins to play.");
      }

      const board = Array(9).fill(false); 
      const shipPositions = generateShipPositions(3);
      shipPositions.forEach(pos => board[pos] = true);

      const initialImage = await createBoardImage(board, []);
      const imagePath = await saveImageToCache(initialImage);
      const sentMessage = await message.reply({ attachment: fs.createReadStream(imagePath) });

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "goingmerry",
        uid: senderID,
        board: board,
        guesses: [],
        remainingGuesses: 6,
        shipCount: 3,
        imagePath: imagePath,
        betAmount: betAmount
      });

    } catch (error) {
      console.error("Error in command:", error);
      message.reply("An error occurred. Please try again.");
    }
  },

  onReply: async function ({ api, message, event, usersData, args }) {
    const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);
    if (!replyData || replyData.uid !== event.senderID) return;

    const { commandName, uid, board, guesses, remainingGuesses, shipCount, imagePath, betAmount } = replyData;
    if (commandName !== "goingmerry") return;


    const userData = await usersData.get(uid);

    const guess = parseInt(args[0]);
    if (isNaN(guess) || guess < 1 || guess > 9 || guesses.includes(guess)) {
      return message.reply("Please provide a valid and unused guess between 1 and 9.");
    }

    const newGuesses = [...guesses, guess];
    const newRemainingGuesses = remainingGuesses - 1;
    const hit = board[guess - 1];
    const newShipCount = hit ? shipCount - 1 : shipCount;


    if (newShipCount === 0) {
      await usersData.set(uid, { money: userData.money + 10000 }); 
      global.GoatBot.onReply.delete(event.messageReply.messageID);
      return message.reply("Congratulations! You found all going merry ship and won 10,000 coins!");
    }

    if (newRemainingGuesses === 0) {
      await usersData.set(uid, { money: userData.money - betAmount }); 
      global.GoatBot.onReply.delete(event.messageReply.messageID);
      return message.reply(`Game over! You ran out of guesses. 500 coins have been deducted from your balance.`);
    }


    const updatedImage = await createBoardImage(board, newGuesses);
    const updatedImagePath = await saveImageToCache(updatedImage);
    const sentMessage = await message.reply({ attachment: fs.createReadStream(updatedImagePath) });

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: "goingmerry",
      uid: uid,
      board: board,
      guesses: newGuesses,
      remainingGuesses: newRemainingGuesses,
      shipCount: newShipCount,
      imagePath: updatedImagePath,
      betAmount: betAmount
    });
  }
};

function generateShipPositions(shipCount) {
  const positions = [];
  while (positions.length < shipCount) {
    const randomPos = Math.floor(Math.random() * 9);
    if (!positions.includes(randomPos)) {
      positions.push(randomPos);
    }
  }
  return positions;
}

async function createBoardImage(board, guesses) {
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gridSize = 100;
  const shipImage = await loadImage(shipImageUrl);

  board.forEach((isShip, index) => {
    const x = (index % 3) * gridSize;
    const y = Math.floor(index / 3) * gridSize;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(x, y, gridSize, gridSize);

    if (guesses.includes(index + 1)) {
      ctx.fillStyle = isShip ? 'red' : 'gray';
      ctx.fillRect(x, y, gridSize, gridSize);
      if (isShip) {
        ctx.drawImage(shipImage, x, y, gridSize, gridSize);
      }
    }
  });

  return canvas.toBuffer();
}

async function saveImageToCache(imageBuffer) {
  const imagePath = path.join(cacheDir, `battleship_${Date.now()}.png`);
  await fs.promises.writeFile(imagePath, imageBuffer);
  return imagePath;
}