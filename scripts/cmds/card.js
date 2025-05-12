const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');


const cacheDir = path.join(__dirname, 'cache');


if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

module.exports = {
  config: {
    name: "card",
    version: "1.0",
    author: "kshitiz",
    role: 0,
    shortDescription: "Generate a random card image",
    longDescription: "Generate a random card image.",
    category: "fun",
    guide: {
      en: "{p}card"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      const cardImage = await generateRandomCard();
      const imagePath = await saveImageToCache(cardImage);
      await message.reply({ attachment: fs.createReadStream(imagePath) });
    } catch (error) {
      console.error("Error:", error);
      message.reply("An error occurred while generating the card.");
    }
  }
};

async function generateRandomCard() {

  const canvas = createCanvas(200, 300);
  const ctx = canvas.getContext('2d');

 
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 10, true, false);


  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 10, false, true);

  
  const suits = ['♥', '♦', '♣', '♠'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];
  const randomValue = values[Math.floor(Math.random() * values.length)];

 
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = randomSuit === '♦' || randomSuit === '♥' ? 'red' : 'black';
  ctx.textAlign = 'center';
  ctx.fillText(randomSuit, canvas.width / 2, canvas.height / 2 + 15);

  
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = randomSuit === '♦' || randomSuit === '♥' ? 'red' : 'black';
  ctx.textAlign = 'left';
  ctx.fillText(randomValue, 15, 40);
  ctx.fillText(randomSuit, 15, 70); 

  
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = randomSuit === '♦' || randomSuit === '♥' ? 'red' : 'black';
  ctx.textAlign = 'right';
  ctx.fillText(randomValue, canvas.width - 15, canvas.height - 15);
  ctx.fillText(randomSuit, canvas.width - 15, canvas.height - 45);

 
  return canvas.toBuffer();
}

async function saveImageToCache(imageBuffer) {
  const imagePath = path.join(cacheDir, `card_${Date.now()}.png`);
  await fs.promises.writeFile(imagePath, imageBuffer);
  return imagePath;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
                                               }
