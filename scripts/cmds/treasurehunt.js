const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const cacheDir = path.join(__dirname, 'cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const characterImageUrl = 'https://i.ibb.co/K0LwhN7/One-Piece-Zoro-Roronoa-Sticker-One-piece-removebg-preview.png';
const treasureImageUrl = 'https://i.ibb.co/WVLmVH4/Open-Treasure-Chest-Vector-Design-Images-Cartoon-Opened-Wooden-Treasure-Chest-Golden-Coins-Box-Isola.png';
const beastImageUrls = [
  'https://i.ibb.co/ss1XCys/Fatalis-Sticker-Dragon-removebg-preview.png',
  'https://i.ibb.co/njMfyJS/download-19-removebg-preview.png',
  'https://i.ibb.co/pjdSjnr/Fenric-Gore-Claw-removebg-preview-removebg-preview.png',

];
const trapImageUrl = 'https://i.ibb.co/m0KzWrW/download-20-removebg-preview.png';

const BEAST_COUNT = 5;

module.exports = {
  config: {
    name: "treasurehunt",
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: "game based on treasure hunt",
    longDescription: "move zoro around the grid to find the treasure, beaware of traps = mihawk",
    category: "game",
    guide: {
      en: "{p}treasurehunt"
    }
  },

  onStart: async function ({ api, message, event, usersData }) {
    try {
      const senderID = event.senderID;

      const initialImage = await createInitialImage();
      const imagePath = await saveImageToCache(initialImage);
      const sentMessage = await message.reply({ attachment: fs.createReadStream(imagePath) });

      const treasurePosition = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
      const beastsPositions = generateRandomPositions(BEAST_COUNT);
      const trapPosition = generateRandomPositionExcept(treasurePosition, beastsPositions);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "treasurehunt",
        uid: senderID,
        position: [0, 0],
        treasure: treasurePosition,
        beasts: beastsPositions,
        trap: trapPosition,
        gameStatus: "active"
      });

    } catch (error) {
      console.error("Error in command:", error);
      message.reply("An error occurred. Please try again.");
    }
  },

  onReply: async function ({ api, message, event, args, usersData }) {
    const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);

    if (!replyData || replyData.uid !== event.senderID) return;

    const { commandName, uid, position, treasure, beasts, trap, gameStatus } = replyData;
    if (commandName !== "treasurehunt") return;

    const userData = await usersData.get(uid);
    const direction = args[0].toLowerCase();

    if (!["up", "down", "left", "right"].includes(direction)) {
      return message.reply("Invalid command. Please reply with 'up', 'down', 'left', or 'right'.");
    }

    if (gameStatus !== "active") {
      return message.reply("The game has ended. Please start a new game.");
    }

    let newPosition = [...position];
    if (direction === "up" && position[1] > 0) newPosition[1]--;
    else if (direction === "down" && position[1] < 4) newPosition[1]++;
    else if (direction === "left" && position[0] > 0) newPosition[0]--;
    else if (direction === "right" && position[0] < 4) newPosition[0]++;

    if (newPosition[0] === treasure[0] && newPosition[1] === treasure[1]) {
      await usersData.set(uid, { money: userData.money + 10000 });
      global.GoatBot.onReply.delete(event.messageReply.messageID);
      return message.reply(`Congratulations! you found the one piece and won 10,000 coins.`);
    } else if (beasts.some(pos => pos[0] === newPosition[0] && pos[1] === newPosition[1])) {
      const encounteredBeastPos = beasts.find(pos => pos[0] === newPosition[0] && pos[1] === newPosition[1]);
      await usersData.set(uid, { money: userData.money + 500 });
      beasts.splice(beasts.findIndex(pos => pos[0] === encounteredBeastPos[0] && pos[1] === encounteredBeastPos[1]), 1);
      const gameImage = await createGameImage(newPosition, treasure, beasts, trap);
      const imagePath = await saveImageToCache(gameImage);
      const sentMessage = await message.reply({ attachment: fs.createReadStream(imagePath) });

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "treasurehunt",
        uid: uid,
        position: newPosition,
        treasure: treasure,
        beasts: beasts,
        trap: trap,
        gameStatus: "active"
      });
      return message.reply(`You hunted a beast and earned 500 coins!`);
    } else if (newPosition[0] === trap[0] && newPosition[1] === trap[1]) {
      const gameImage = await createGameImage(newPosition, treasure, beasts, trap, true);
      const imagePath = await saveImageToCache(gameImage);
      await message.reply({ attachment: fs.createReadStream(imagePath) });

      global.GoatBot.onReply.delete(event.messageReply.messageID);
      await usersData.set(uid, { money: 0 });
      return message.reply(`Oh no! You fell into mihawk and lost the fight and money. Game Over.`);
    } else {
      const gameImage = await createGameImage(newPosition, treasure, beasts, trap);
      const imagePath = await saveImageToCache(gameImage);
      const sentMessage = await message.reply({ attachment: fs.createReadStream(imagePath) });

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "treasurehunt",
        uid: uid,
        position: newPosition,
        treasure: treasure,
        beasts: beasts,
        trap: trap,
        gameStatus: "active"
      });
    }
  }
};

function generateRandomPositions(count) {
  const positions = [];
  while (positions.length < count) {
    const pos = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
    if (!positions.some(p => p[0] === pos[0] && p[1] === pos[1])) {
      positions.push(pos);
    }
  }
  return positions;
}

function generateRandomPositionExcept(exclude, otherExcludes = []) {
  let pos;
  do {
    pos = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
  } while (
    pos[0] === exclude[0] && pos[1] === exclude[1] ||
    otherExcludes.some(p => p[0] === pos[0] && p[1] === pos[1])
  );
  return pos;
}

async function createInitialImage() {
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');

  
  ctx.strokeStyle = 'red';
  for (let i = 0; i <= 5; i++) {
    ctx.moveTo(i * 100, 0);
    ctx.lineTo(i * 100, 500);
    ctx.moveTo(0, i * 100);
    ctx.lineTo(500, i * 100);
  }
  ctx.stroke();


  const characterImage = await loadImage(characterImageUrl);
  ctx.drawImage(characterImage, 0, 0, 100, 100);

  return canvas.toBuffer();
}

async function createGameImage(position, treasure, beasts, trap, hideCharacter = false) {
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');

  
  ctx.strokeStyle = 'red';
  for (let i = 0; i <= 5; i++) {
    ctx.moveTo(i * 100, 0);
    ctx.lineTo(i * 100, 500);
    ctx.moveTo(0, i * 100);
    ctx.lineTo(500, i * 100);
  }
  ctx.stroke();

  
  const characterImage = await loadImage(characterImageUrl);
  const trapImage = await loadImage(trapImageUrl);
  const treasureImage = await loadImage(treasureImageUrl);
  const beastImages = await Promise.all(beastImageUrls.map(url => loadImage(url)));


  for (let beast of beasts) {
    const beastImage = beastImages[Math.floor(Math.random() * beastImages.length)];
    ctx.drawImage(beastImage, beast[0] * 100, beast[1] * 100, 100, 100);
  }

  
  if (position[0] === trap[0] && position[1] === trap[1]) {
    ctx.drawImage(trapImage, trap[0] * 100, trap[1] * 100, 100, 100);
  }


  if (position[0] === treasure[0] && position[1] === treasure[1]) {
    ctx.drawImage(treasureImage, treasure[0] * 100, treasure[1] * 100, 100, 100);
  }


  if (!hideCharacter) {
    ctx.drawImage(characterImage, position[0] * 100, position[1] * 100, 100, 100);
  }

  return canvas.toBuffer();
}

async function saveImageToCache(imageBuffer) {
  const imagePath = path.join(cacheDir, `treasure.png`);
  await fs.promises.writeFile(imagePath, imageBuffer);
  return imagePath;
}