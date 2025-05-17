const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const cacheDir = path.join(__dirname, 'cache');
const wheelDataFile = path.join(__dirname, 'wheel.json');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

let wheelData = {};
if (fs.existsSync(wheelDataFile)) {
  wheelData = JSON.parse(fs.readFileSync(wheelDataFile, 'utf8'));
}

module.exports = {
  config: {
    name: "wheel",
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: "Spin the wheel",
    longDescription: "Create your own lucky wheel and spin to get random result",
    guide: {
      en: "{p}wheel view - View your created wheel\n{p}wheel spin - Spin the wheel\n{p}wheel maker - Create or edit your wheel"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    try {
      const senderID = event.senderID;
      const userWheelData = wheelData[senderID] || { contents: [] };

      if (args.length === 0) {
        return message.reply("Use 'wheel view' to view your wheel, 'wheel spin' to spin your wheel, or 'wheel maker' to create or edit your wheel.");
      }

      if (args[0] === 'view') {
        if (userWheelData.contents.length === 0) {
          return message.reply("You haven't created a wheel yet. Use 'wheel maker' to create one.");
        }

        const wheelImage = await createWheel(userWheelData.contents);
        const imagePath = await saveImageToCache(wheelImage);
        return message.reply({ attachment: fs.createReadStream(imagePath) });

      } else if (args[0] === 'spin') {
        if (userWheelData.contents.length === 0) {
          return message.reply("You haven't created a wheel yet. Use 'wheel maker' to create one.");
        }

        const result = userWheelData.contents[Math.floor(Math.random() * userWheelData.contents.length)];
        const resultImage = await createResultImage(result);
        const imagePath = await saveImageToCache(resultImage);
        return message.reply({ attachment: fs.createReadStream(imagePath) });

      } else if (args[0] === 'maker') {
        const blankWheelImage = await createBlankWheel();
        const imagePath = await saveImageToCache(blankWheelImage);
        const sentMessage = await message.reply({ attachment: fs.createReadStream(imagePath), body: "Reply with your contents in the format: {content1} - {content2} - ... (max 7 contents)." });

        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: "wheel",
          uid: senderID,
          action: 'maker'
        });

      } else {
        message.reply("Use 'wheel view' to view your wheel, 'wheel spin' to spin your wheel, or 'wheel maker' to create or edit your wheel.");
      }

    } catch (error) {
      console.error("Error in command:", error);
      message.reply("An error occurred. Please try again.");
    }
  },

  onReply: async function ({ api, message, event, args, usersData }) {
    const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);
    if (!replyData || replyData.uid !== event.senderID) return;

    const { commandName, uid, action } = replyData;
    if (commandName !== "wheel") return;

    if (action === 'maker') {
      const contents = event.body.split(' - ').slice(0, 7);
      if (contents.length < 1) {
        return message.reply("Please provide at least one content.");
      }

      wheelData[uid] = { contents };
      fs.writeFileSync(wheelDataFile, JSON.stringify(wheelData, null, 2));

      const wheelImage = await createWheel(contents);
      const imagePath = await saveImageToCache(wheelImage);
      return message.reply({ attachment: fs.createReadStream(imagePath), body: "Your wheel is ready! Use 'wheel view' to see it or 'wheel spin' to spin it." });
    }
  }
};

async function createBlankWheel() {
  const canvas = createCanvas(800, 800);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const segmentCount = 7;
  const segmentColors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'];

  for (let i = 0; i < segmentCount; i++) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, (i * 2 * Math.PI) / segmentCount, ((i + 1) * 2 * Math.PI) / segmentCount);
    ctx.closePath();
    ctx.fillStyle = segmentColors[i];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('Add your contents', centerX - 200, centerY);

  return canvas;
}

async function createWheel(contents) {
  const canvas = createCanvas(800, 800);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const segmentCount = contents.length;
  const segmentColors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'];

  for (let i = 0; i < segmentCount; i++) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, (i * 2 * Math.PI) / segmentCount, ((i + 1) * 2 * Math.PI) / segmentCount);
    ctx.closePath();
    ctx.fillStyle = segmentColors[i % segmentColors.length];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(((i + 0.5) * 2 * Math.PI) / segmentCount);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(contents[i], radius / 2, 0);
    ctx.restore();
  }

  return canvas;
}



async function createResultImage(result) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');


  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f0f8ff');
  gradient.addColorStop(1, '#e6e6fa');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  
  ctx.strokeStyle = '#00008b';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

 
  ctx.fillStyle = '#00008b';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Congratulations!', canvas.width / 2, 100);


  ctx.fillStyle = '#ff4500';
  ctx.font = 'bold 40px Arial';
  ctx.fillText(`You got: ${result}`, canvas.width / 2, 220);

 
  const starCount = 5;
  const starRadius = 15;
  ctx.fillStyle = '#ffd700';
  for (let i = 0; i < starCount; i++) {
    drawStar(ctx, 100 + i * 140, 300, starRadius, 5, 0.5);
  }


  ctx.fillStyle = '#add8e6';
  ctx.beginPath();
  ctx.arc(200, 300, 30, 0, 2 * Math.PI);
  ctx.arc(600, 300, 30, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = '#ffa07a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 280);
  ctx.lineTo(250, 320);
  ctx.moveTo(550, 280);
  ctx.lineTo(650, 320);
  ctx.stroke();

  return canvas;
}


function drawStar(ctx, x, y, radius, points, inset) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  for (let i = 0; i < points; i++) {
    ctx.lineTo(x + radius * Math.cos((i * 2 * Math.PI) / points), y - radius * Math.sin((i * 2 * Math.PI) / points));
    ctx.lineTo(x + inset * radius * Math.cos(((i + 0.5) * 2 * Math.PI) / points), y - inset * radius * Math.sin(((i + 0.5) * 2 * Math.PI) / points));
  }
  ctx.closePath();
  ctx.fill();
}

async function saveImageToCache(image) {
  const buffer = image.toBuffer();
  const filePath = path.join(cacheDir, `wheel_${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}