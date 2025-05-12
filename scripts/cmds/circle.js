const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "circle",
    aliases: [],
    version: "1.0",
    author: "vex_Kshitiz",
    shortDescription: "add circular design in image",
    longDescription: "add circular design in image",
    category: "image",
    guide: {
      en: "{p}circle [Number]"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      if (event.type !== "message_reply") {
        return message.reply("❌ || Reply to an image to make it circular.\nex: {p}circle 1");
      }

      const borderNumber = args[0] ? parseInt(args[0]) : 0;
      if (isNaN(borderNumber) || borderNumber < 0 || borderNumber > 50) {
        return message.reply("❌ || Please provide a valid border number (0-50).");
      }

      const attachment = event.messageReply.attachments[0];
      if (!attachment || !["photo", "sticker"].includes(attachment.type)) {
        return message.reply("❌ || Reply to an image.");
      }

      const imageUrl = attachment.url;

      const image = await loadImage(imageUrl);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      ctx.beginPath();
      ctx.arc(image.width / 2, image.height / 2, Math.min(image.width, image.height) / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, 0, 0, image.width, image.height);
      ctx.closePath();

      if (borderNumber > 0) {
        addBorder(ctx, image, borderNumber);
      }

      const cacheFolderPath = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const cachedImagePath = path.join(cacheFolderPath, `circle.png`);
      const out = fs.createWriteStream(cachedImagePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        message.reply({
          body: "",
          attachment: fs.createReadStream(cachedImagePath)
        });
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred. Please try again later.");
    }
  }
};

function addBorder(ctx, image, borderNumber) {
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#000000', '#808000', '#008000', '#800080', '#008080', '#000080',
    '#FF6347', '#4682B4', '#DAA520', '#CD5C5C', '#4B0082', '#7FFF00',
    '#D2691E', '#6495ED', '#FF4500', '#2E8B57', '#FFD700', '#6A5ACD',
    '#FF1493', '#00CED1', '#FF7F50', '#40E0D0', '#EE82EE', '#8A2BE2',
    '#FF69B4', '#BDB76B', '#8B4513', '#F08080', '#DA70D6', '#FFDAB9',
    '#E6E6FA', '#D8BFD8', '#FFFACD', '#AFEEEE', '#F0E68C', '#FAFAD2',
    '#B0E0E6', '#FFE4E1', '#FFE4B5', '#FFEBCD', '#FFEFD5', '#F5F5DC'
  ];
  const borderWidth = 10;
  const radius = Math.min(image.width, image.height) / 2;
  const color = colors[(borderNumber - 1) % colors.length];

  ctx.beginPath();
  ctx.arc(image.width / 2, image.height / 2, radius, 0, Math.PI * 2);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
        }
