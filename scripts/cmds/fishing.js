const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const cacheDir = path.join(__dirname, 'cache');
const fishingDataFile = path.join(__dirname, 'fishing.json');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const fishTypes = [
  { name: 'Elish', price: 150, image: 'https://i.ibb.co/zm0GTWC/images-1.jpg' },
  { name: 'Octopus', price: 120, image: 'https://i.ibb.co/S7Fd8PD/images.jpg' },
  { name: 'Goldfish', price: 10, image: 'https://i.ibb.co/ssq0VHm/images-2.jpg' },
  { name: 'Salmon', price: 30, image: 'https://i.ibb.co/SrYwhBc/640x427-Salmon-Sockeye-NOAAFisheries.png' },
  { name: 'Tuna', price: 50, image: 'https://i.ibb.co/wJyV6sC/tuna.jpg' },
  { name: 'Shark', price: 100, image: 'https://i.ibb.co/84jtvt6/Corl0207-28225976491.jpg' }
];

let fishingData = {};
if (fs.existsSync(fishingDataFile)) {
  fishingData = JSON.parse(fs.readFileSync(fishingDataFile, 'utf8'));
}

function startFishing(usersData) {
  setInterval(() => {
    for (const userID in fishingData) {
      const user = fishingData[userID];
      user.fishes.forEach(fish => {
        user.totalEarnings += fishTypes[fish.type].price;
      });

      if (user.totalEarnings > 0) {
        usersData.get(userID).then(userData => {
          userData.money += user.totalEarnings;
          usersData.set(userID, userData);
        }).catch(console.error);

        user.fishes = []; 
        user.totalEarnings = 0;
      }
    }
    fs.writeFileSync(fishingDataFile, JSON.stringify(fishingData, null, 2));
  }, 3600000);
}

function resetFishingCount() {
  for (const userID in fishingData) {
    fishingData[userID].fishingCount = 0;
  }
  fs.writeFileSync(fishingDataFile, JSON.stringify(fishingData, null, 2));
}

setInterval(resetFishingCount, 3600000);  // Reset fishing count every hour

module.exports = {
  config: {
    name: "fishing",
    version: "1.1",
    author: "Vex_kshitiz",
    role: 0,
    shortDescription: "Go fishing and earn Money!",
    longDescription: "Catch fish and sell them to earn coins.",
    category: "game",
    guide: {
      en: "{p}fishing - Start fishing\n{p}fishing sell - Sell your caught fish\n{p}fishing list - View your caught fish"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    try {
      startFishing(usersData);

      const senderID = event.senderID;

      if (!fishingData[senderID]) {
        fishingData[senderID] = { fishes: [], totalEarnings: 0, fishingCount: 0 };
      }

      const userFishingData = fishingData[senderID];

      if (args.length === 0) {
        // Check if the user has exceeded the fishing limit
        if (userFishingData.fishingCount >= 6) {
          return message.reply("You've reached your fishing limit for this hour. Please try again later.");
        }

        // Catch fish
        const caughtFish = await catchFish();
        fishingData[senderID].fishes.push(caughtFish);
        fishingData[senderID].fishingCount += 1;  // Increment the fishing count

        const fishImage = await createFishImage(caughtFish);
        const imagePath = await saveImageToCache(fishImage);
        await message.reply({ attachment: fs.createReadStream(imagePath), body: `You caught a ${caughtFish.name} worth ${caughtFish.price} $` });

        fs.writeFileSync(fishingDataFile, JSON.stringify(fishingData, null, 2));

      } else if (args[0] === 'sell') {
        if (userFishingData.fishes.length === 0) {
          return message.reply("You have no fish to sell.");
        }

        let totalEarnings = 0;
        userFishingData.fishes.forEach(fish => {
          totalEarnings += fishTypes[fish.type].price;
        });

        userFishingData.fishes = [];
        userFishingData.totalEarnings = 0;

        const user = await usersData.get(senderID);
        user.money += totalEarnings;
        await usersData.set(senderID, user);

        message.reply(`You sold your fish for a total of ${totalEarnings} $!`);

      } else if (args[0] === 'list') {
        if (userFishingData.fishes.length === 0) {
          return message.reply("You have no fish.");
        }

        const fishListImage = await createFishListImage(userFishingData.fishes);
        const imagePath = await saveImageToCache(fishListImage);
        await message.reply({ attachment: fs.createReadStream(imagePath) });

      } else {
        message.reply("Use '{p}fishing' to start fishing, '{p}fishing sell' to sell your caught fish, or '{p}fishing list' to view your caught fish.");
      }

    } catch (error) {
      console.error("Error in command:", error);
      message.reply("An error occurred. Please try again.");
    }
  }
};

async function catchFish() {
  const fishIndex = Math.floor(Math.random() * fishTypes.length);
  return { type: fishIndex, name: fishTypes[fishIndex].name, price: fishTypes[fishIndex].price };
}

async function createFishImage(fish) {
  const canvas = createCanvas(400, 300);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fishImage = await loadImage(fishTypes[fish.type].image);
  ctx.drawImage(fishImage, 50, 50, 300, 200);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`${fish.name}`, 50, 30);
  ctx.fillText(`Price: ${fish.price}`, 50, 270);

  return canvas;
}

async function createFishListImage(fishes) {
  const canvas = createCanvas(600, 800);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < fishes.length; i++) {
    const fish = fishes[i];
    const fishType = fishTypes[fish.type];
    const fishImage = await loadImage(fishType.image);

    const y = 20 + i * 150;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${i + 1}. ${fishType.name}`, 20, y + 20);
    ctx.fillText(`Price: ${fishType.price}`, 20, y + 50);

    ctx.drawImage(fishImage, 400, y, 120, 120);
  }

  return canvas;
}

async function saveImageToCache(image) {
  const buffer = image.toBuffer();
  const filePath = path.join(cacheDir, `fishing.png`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
   }
