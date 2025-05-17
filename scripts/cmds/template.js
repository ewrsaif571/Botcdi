const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const templateImages = {
  1: "https://i.postimg.cc/tTrHHZTd/pixelcut-export-4.png",
  2: "https://i.ibb.co/FqkwM6P/image.jpg",
  3: "https://i.ibb.co/KNVxy3V/The-12-Best-Free-Internet-Phone-Calls-Apps-of-2024.jpg",
  4: "https://i.ibb.co/wwqmZCg/photo-editing.jpg",
  5: "https://i.ibb.co/fGhJ3bs/download-3.jpg",
  6: "https://i.ibb.co/TTHypc5/Brown-creative-birthday-story-idia-for-intragram.jpg",
  7: "https://i.ibb.co/ssBsLbH/Black-creative-birthday-story-idia-for-intragram.jpg",
  8: "https://i.ibb.co/86S319c/overlay.jpg",
  9: "https://i.ibb.co/G3F93fY/4-4.jpg",
  10: "https://i.ibb.co/VgLdttW/download-6.jpg",
  11: "https://i.ibb.co/j360Ddp/layout-1.jpg",
  12: "https://i.ibb.co/tQmVWVc/download-7.jpg",
  13: "https://i.ibb.co/cxzZShg/instagramtemplate-ig-storytemplate.jpg",
  14: "https://i.ibb.co/j6Hcjt1/Template-Qris-Anime.jpg",
  15: "https://i.ibb.co/6Wj206D/Qu-500-follows-Y-u-t-t-c-c-c-c-u.jpg",
  16: "https://i.ibb.co/wp3HQCd/download-8.jpg",
  17: "https://i.ibb.co/BnPStDv/L-y-nh-follow.jpg",
  18: "https://i.ibb.co/pP54cfq/download-9.jpg",
  19: "https://i.ibb.co/KmD8VQK/download-10.jpg",
  20: "https://i.ibb.co/Kwg8hVs/Fram.jpg",
  21: "https://i.ibb.co/hRcdfRX/download-11.jpg",
  22: "https://i.ibb.co/W688hNB/E-T.jpg"
  
  
};


module.exports = {
  config: {
    name: "template",
    aliases: ["tmpl"],
    version: "1.0",
    author: "Vex_kshitiz",
    shortDescription: "Overlay  images on templates",
    longDescription: "ad your images on templates.",
    category: "image",
    guide: {
      en: "{p}template <1|2|3>\n\nTemplate 1."
    }
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      if (event.type !== "message_reply") {
        return message.reply("Please reply to the image you want to overlay on the template.");
      }

      const attachment = event.messageReply.attachments;
      const templateNumber = parseInt(args[0]);

      if (isNaN(templateNumber) || ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,18, 19, 20, 21, 22].includes(templateNumber)) {
        return message.reply("Invalid template number. Please choose from 1 - 22");
      }

      if (templateNumber === 1) {
        if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
          return message.reply("Please reply to one photo.");
        }

        const imageUrl = attachment[0].url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const userImage = await loadImage(response.data);
        const templateImage = await loadImage(templateImages[1]);

        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0);

        const circleSize = 130; 
        const circleX = 335;
        const circleY = 300; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX + circleSize / 2, circleY + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImage, circleX, circleY, circleSize, circleSize);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template1.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      } else if (templateNumber === 2) {
        if (!attachment || attachment.length !== 2 || attachment.some(att => att.type !== "photo")) {
          return message.reply("Please reply to two photo.");
        }

        const responses = await Promise.all(attachment.map(att => axios.get(att.url, { responseType: 'arraybuffer' })));
        const userImages = await Promise.all(responses.map(res => loadImage(res.data)));
        const templateImage = await loadImage(templateImages[2]);

        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0);

        const circleSize1 = 309; 
        const circleX1 = 255;
        const circleY1 = 378; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX1 + circleSize1 / 2, circleY1 + circleSize1 / 2, circleSize1 / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImages[0], circleX1, circleY1, circleSize1, circleSize1);
        ctx.restore();

        const circleSize2 = 207; 
        const circleX2 = 54; 
        const circleY2 = 34;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX2 + circleSize2 / 2, circleY2 + circleSize2 / 2, circleSize2 / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImages[1], circleX2, circleY2, circleSize2, circleSize2);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template2.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      } else if (templateNumber === 3) {
        if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
          return message.reply("Please reply to one photo.");
        }

        const imageUrl = attachment[0].url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const userImage = await loadImage(response.data);
        const templateImage = await loadImage(templateImages[3]);

        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0);

        const circleSize = 275;
        const circleX = 230; 
        const circleY = 285; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX + circleSize / 2, circleY + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImage, circleX, circleY, circleSize, circleSize);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template3.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }
      else if (templateNumber === 4) {
        if (!attachment || attachment.length !== 4 || attachment.some(att => att.type !== "photo")) {
          return message.reply("Please reply to four photo.");
        }

        const responses = await Promise.all(attachment.map(att => axios.get(att.url, { responseType: 'arraybuffer' })));
        const userImages = await Promise.all(responses.map(res => loadImage(res.data)));
        const templateImage = await loadImage(templateImages[4]);

        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0);

       
        const squareSize = 145; 
        const squarePositions = [
          { x: 100, y: 375 },   
          { x: 296, y: 375 },  
          { x: 490, y: 375 }   
        ];
        const circleSize = 170;
        const circlePosition = { x: 60, y: 42 }; 

     
        for (let i = 0; i < 3; i++) {
          const { x, y } = squarePositions[i];
          ctx.drawImage(userImages[i], x, y, squareSize, squareSize);
        }

       
        ctx.save();
        ctx.beginPath();
        ctx.arc(circlePosition.x + circleSize / 2, circlePosition.y + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImages[3], circlePosition.x, circlePosition.y, circleSize, circleSize);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template4.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }
      else if (templateNumber === 5) {
        if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
          return message.reply("Please reply to one photo.");
        }

        const imageUrl = attachment[0].url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const userImage = await loadImage(response.data);
        const templateImage = await loadImage(templateImages[5]);

        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0);

        const imageWidth = 460; 
        const imageHeight = 460; 
        const imageX = 135; 
        const imageY = 320; 

        ctx.drawImage(userImage, imageX, imageY, imageWidth, imageHeight);

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template5.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }
      else if (templateNumber === 6) {
        if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
          return message.reply("Please reply to one photo.");
        }

        const imageUrl = attachment[0].url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const userImage = await loadImage(response.data);
        const templateImage = await loadImage(templateImages[6]);

        const canvasWidth = templateImage.width;
        const canvasHeight = templateImage.height;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

        const imageWidth = 400;
        const imageHeight = 510; 
        const imageX = 167; 
        const imageY = 420; 

        ctx.drawImage(userImage, imageX, imageY, imageWidth, imageHeight);

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template6.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }
      else if (templateNumber === 7) {
        if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
          return message.reply("Please reply to one photo.");
        }

        const imageUrl = attachment[0].url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const userImage = await loadImage(response.data);
        const templateImage = await loadImage(templateImages[7]);

        const canvasWidth = templateImage.width;
        const canvasHeight = templateImage.height;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

        const circleSize = 390; 
        const circleX = 173; 
        const circleY = 460;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX + circleSize / 2, circleY + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImage, circleX, circleY, circleSize, circleSize);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template7.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }
      else if (templateNumber === 8) {
        if (!attachment || attachment.length !== 5 || attachment.some(att => att.type !== "photo")) {
          return message.reply("Please reply to five photos.");
        }

        const responses = await Promise.all(attachment.map(att => axios.get(att.url, { responseType: 'arraybuffer' })));
        const userImages = await Promise.all(responses.map(res => loadImage(res.data)));
        const templateImage = await loadImage(templateImages[8]);

        const canvasWidth = templateImage.width;
        const canvasHeight = templateImage.height;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

      
        const rect1Width = 150; 
        const rect1Height = 150; 
        const rect1X = 455; 
        const rect1Y = 520; 
        ctx.drawImage(userImages[0], rect1X, rect1Y, rect1Width, rect1Height);

     
        const rect2Width = 150; 
        const rect2Height = 150; 
        const rect2X = 285;
        const rect2Y = 520; 
        ctx.drawImage(userImages[1], rect2X, rect2Y, rect2Width, rect2Height);

      
        const rect3Width = 150; 
        const rect3Height = 150; 
        const rect3X = 112; 
        const rect3Y = 520; 
        ctx.drawImage(userImages[2], rect3X, rect3Y, rect3Width, rect3Height);

   
        const rect4Width = 300; 
        const rect4Height = 310;
        const rect4X = 53; 
        const rect4Y = 92; 
        ctx.drawImage(userImages[3], rect4X, rect4Y, rect4Width, rect4Height);

       
        const circleSize = 230; 
        const circleX = 428; 
        const circleY = 95; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX + circleSize / 2, circleY + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImages[4], circleX, circleY, circleSize, circleSize);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template8.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }
      else if (templateNumber === 9) {
        if (!attachment || attachment.length !== 4 || attachment.some(att => att.type !== "photo")) {
          return message.reply("Please reply to four photo.");
        }

        const responses = await Promise.all(attachment.map(att => axios.get(att.url, { responseType: 'arraybuffer' })));
        const userImages = await Promise.all(responses.map(res => loadImage(res.data)));
        const templateImage = await loadImage(templateImages[9]);

        const canvasWidth = templateImage.width;
        const canvasHeight = templateImage.height;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

        
        const circleSize1 = 182; 
        const circleX1 = 27; 
        const circleY1 = 9; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX1 + circleSize1 / 2, circleY1 + circleSize1 / 2, circleSize1 / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImages[0], circleX1, circleY1, circleSize1, circleSize1);
        ctx.restore();

       
        const circleSize2 = 150; 
        const circleX2 = 45; 
        const circleY2 = 540;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX2 + circleSize2 / 2, circleY2 + circleSize2 / 2, circleSize2 / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImages[1], circleX2, circleY2, circleSize2, circleSize2);
        ctx.restore();

       
        const circleSize3 = 150;
        const circleX3 =  202; 
        const circleY3 = 540; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX3 + circleSize3 / 2, circleY3 + circleSize3 / 2, circleSize3 / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImages[2], circleX3, circleY3, circleSize3, circleSize3);
        ctx.restore();

       
        const circleSize4 = 150; 
        const circleX4 = 373;
        const circleY4 = 539; 

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX4 + circleSize4 / 2, circleY4 + circleSize4 / 2, circleSize4 / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImages[3], circleX4, circleY4, circleSize4, circleSize4);
        ctx.restore();

        const cacheFolderPath = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }

        const imagePath = path.join(cacheFolderPath, `template9.png`);
        const out = fs.createWriteStream(imagePath);
        canvas.createPNGStream().pipe(out);
        out.on('finish', () => {
          message.reply({
            body: "",
            attachment: fs.createReadStream(imagePath)
          });
        });
      }

      else if (templateNumber === 10) {
        if (!attachment || attachment.length !== 2 || attachment.some(att => att.type !== "photo")) {
          return message.reply("Please reply to two photo.");
        }

        const responses = await Promise.all(attachment.map(att => axios.get(att.url, { responseType: 'arraybuffer' })));
        const userImages = await Promise.all(responses.map(res => loadImage(res.data)));
        const templateImage = await loadImage(templateImages[10]);

        const canvasWidth = templateImage.width;
        const canvasHeight = templateImage.height;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

       
        const rectWidth1 = 300; 
        const rectHeight1 = 295; 
        const rectX1 = 351;
        const rectY1 = 140; 
        const tilt1 = 0.25;

        ctx.save();
        ctx.translate(rectX1 + rectWidth1 / 2, rectY1 + rectHeight1 / 2);
        ctx.rotate(tilt1);
        ctx.drawImage(userImages[0], -rectWidth1 / 2, -rectHeight1 