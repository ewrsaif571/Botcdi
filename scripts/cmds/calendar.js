const fetch = require('node-fetch');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const cacheDirectory = path.join(__dirname, 'cache');

module.exports = {
  config: {
    name: "calendar",
    aliases: [],
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    shortDescription: "English calendar",
    longDescription: "English calendar.",
    category: "Utility",
    guide: {
      en: "{p}calendar"
    }
  },

  onStart: async function ({ api, event }) {
    try {

      const response = await fetch('https://eng-calendar-gamma.vercel.app/kshitiz');
      const data = await response.json();


      const canvas = createCanvas(540, 460);
      const ctx = canvas.getContext('2d');


      ctx.fillStyle = '#ADD8E6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);


      drawCalendar(ctx, canvas, data);

      const imageBuffer = canvas.toBuffer();
      const imagePath = path.join(cacheDirectory, 'english_calendar.png');
      await fs.promises.mkdir(cacheDirectory, { recursive: true });
      await fs.promises.writeFile(imagePath, imageBuffer);


      api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
};

function drawCalendar(ctx, canvas, data) {
  ctx.font = '20px Arial'; 

  const cellWidth = 70; 
  const cellHeight = 70;
  const startX = 25; 
  const startY = 70; 
  const nameYearY = 50;

  ctx.fillStyle = 'lime'; 

  ctx.shadowColor = 'black';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  const nameYearText = `${data.res.name} / ${data.res.year}`;
  ctx.fillText(nameYearText, startX, nameYearY);

  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = 'black'; 
  ctx.font = '16px Arial'; 

  const totalDays = data.res.days.length;
  let row = 0;
  let col = 0;

  for (let i = 0; i < totalDays; i++) {
    const day = data.res.days[i];
    const x = startX + (col * cellWidth);
    const y = startY + (row * cellHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellWidth, cellHeight);

    ctx.fillStyle = day.tag === "today" ? 'red' : 'white';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    ctx.fillText(day.ad, x + 20, y + 30); 
    ctx.font = '10px Arial';
    ctx.fillText(day.day, x + cellWidth / 10, y + cellHeight - 10);
    ctx.font = '10px Arial'; 

    col++;
    if (col === 7) {
      col = 0;
      row++;
    }
  }
}