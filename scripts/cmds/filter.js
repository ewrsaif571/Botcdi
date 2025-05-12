const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "filter",
    aliases: ["filter"],
    version: "1.0",
    author: "vex_Kshitiz",
    shortDescription: "Apply filters to images",
    longDescription: "Apply various filters to images.",
    category: "tool",
    guide: {
      en: "{p}filter [filterNumber]"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      if (event.type !== "message_reply") {
        return message.reply("❌ || Reply to an image to apply a filter.\nex:{p}filter 1");
      }

      const filterNumber = parseInt(args[0]);
      if (isNaN(filterNumber) || filterNumber < 1 || filterNumber > 20) {
        return message.reply("❌ || Please provide a valid filter number (1-17).");
      }

      const attachment = event.messageReply.attachments[0];
      if (!attachment || !["photo", "sticker"].includes(attachment.type)) {
        return message.reply("❌|| rply to image");
      }

      const imageUrl = attachment.url;


      const image = await loadImage(imageUrl);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');


      applyFilter(ctx, image, filterNumber);


      const cacheFolderPath = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const cachedImagePath = path.join(cacheFolderPath, `filter.png`);
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


function applyFilter(ctx, image, filterNumber) {
    switch (filterNumber) {
        case 1:
            applyColorFilter(ctx, image, 'grayscale');
            break;
        case 2:
            applySharpeningFilter(ctx, image);
            break;
        case 3:
            applyNoiseFilter(ctx, image);
            break;
        case 4:
            applySepiaFilter(ctx, image);
            break;
        case 5:
            applyInvertFilter(ctx, image);
            break;
        case 6:
            applyHueSaturationFilter(ctx, image, 90, 1);
            break;
        case 7:
            applyGaussianBlur(ctx, image);
            break;
        case 8:
            applyEmboss(ctx, image);
            break;
        case 9:
            applyBrightnessFilter(ctx, image, 50);
            break;
        case 10:
            applyContrastFilter(ctx, image, 50);
            break;
        case 11:
            applyVintageFilter(ctx, image);
            break;

        case 12:
            applySolarizeFilter(ctx, image);
            break;
        case 13:
            applyThresholdFilter(ctx, image, 128);
            break;
        case 14:
            applyPosterizeFilter(ctx, image, 5);
            break;
        case 15:
            applyColorizeFilter(ctx, image, 'blue');
            break;
        case 16:
            applySepiaVignetteFilter(ctx, image);
            break;
        case 17:
            applyWatercolorFilter(ctx, image);
            break;

        default:
            throw new Error("Invalid filter number.");
    }
}



function applyColorFilter(ctx, image, filterType) {
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; 
    data[i + 1] = avg; 
    data[i + 2] = avg; 
  }
  ctx.putImageData(imageData, 0, 0);
}




function applySharpeningFilter(ctx, image) {

  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]; 
  ctx.drawImage(image, 0, 0);
  ctx.filter = 'none';
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  const weight = 1 / 9;
  for (let i = 0; i < data.length; i += 4) {
    let sumR = 0, sumG = 0, sumB = 0;
    for (let j = 0; j < kernel.length; j++) {
      const x = i + (j % 3 - 1) * 4;
      const y = i + Math.floor(j / 3) * image.width * 4;
      sumR += data[x] * kernel[j];
      sumG += data[x + 1] * kernel[j];
      sumB += data[x + 2] * kernel[j];
    }
    data[i] = sumR * weight;
    data[i + 1] = sumG * weight;
    data[i + 2] = sumB * weight;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyNoiseFilter(ctx, image) {

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 50 - 25; 
    data[i] += noise; 
    data[i + 1] += noise;
    data[i + 2] += noise; 
  }
  ctx.putImageData(imageData, 0, 0);
}

function applySepiaFilter(ctx, image) {

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
  }
  ctx.putImageData(imageData, 0, 0);
}


function applyInvertFilter(ctx, image) {

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imageData, 0, 0);
}


function applyHueSaturationFilter(ctx, image, hue, saturation) {

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  const hsv = rgbToHsv(imageData);

  for (let i = 0; i < data.length; i += 4) {
    const { h, s, v } = hsv[i / 4];
    hsv[i / 4].h = (h + hue) % 360;
    hsv[i / 4].s = Math.max(0, Math.min(1, s * saturation));
  }

  const newRgb = hsvToRgb(hsv);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = newRgb[i];
    data[i + 1] = newRgb[i + 1];
    data[i + 2] = newRgb[i + 2];
  }

  ctx.putImageData(imageData, 0, 0);
}

function rgbToHsv(imageData) {
  const data = imageData.data;
  const hsv = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    hsv.push({ h: h * 360, s, v });
  }

  return hsv;
}

function hsvToRgb(hsv) {
  const newRgb = [];

  for (let i = 0; i < hsv.length; i++) {
    const { h, s, v } = hsv[i];
    let r, g, b;
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    newRgb.push(Math.round((r + m) * 255));
    newRgb.push(Math.round((g + m) * 255));
    newRgb.push(Math.round((b + m) * 255));
    newRgb.push(255); 
  }

  return newRgb;
}
function applyGaussianBlur(ctx, image) {
    const kernel = [
        [1, 4, 7, 4, 1],
        [4, 16, 26, 16, 4],
        [7, 26, 41, 26, 7],
        [4, 16, 26, 16, 4],
        [1, 4, 7, 4, 1]
    ];
    const divisor = 273; 
    const offset = 0;

    applyConvolutionFilter(ctx, image, kernel, divisor, offset);
}




function applyEmboss(ctx, image) {
    const kernel = [
        [-2, -1, 0],
        [-1, 1, 1],
        [0, 1, 2]
    ];
    const divisor = 1;
    const offset = 128;

    applyConvolutionFilter(ctx, image, kernel, divisor, offset);
}
function applyConvolutionFilter(ctx, image, kernel, divisor, offset) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const halfKernelSize = Math.floor(kernel.length / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            for (let ky = 0; ky < kernel.length; ky++) {
                for (let kx = 0; kx < kernel.length; kx++) {
                    const pixelX = x + kx - halfKernelSize;
                    const pixelY = y + ky - halfKernelSize;
                    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                        const pixelIndex = (pixelY * width + pixelX) * 4;
                        const kernelValue = kernel[ky][kx];
                        r += data[pixelIndex] * kernelValue;
                        g += data[pixelIndex + 1] * kernelValue;
                        b += data[pixelIndex + 2] * kernelValue;
                    }
                }
            }
            const dataIndex = (y * width + x) * 4;
            data[dataIndex] = clamp((r / divisor) + offset, 0, 255);
            data[dataIndex + 1] = clamp((g / divisor) + offset, 0, 255);
            data[dataIndex + 2] = clamp((b / divisor) + offset, 0, 255);
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function applyBrightnessFilter(ctx, image, brightness) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] += brightness; 
        data[i + 1] += brightness; 
        data[i + 2] += brightness; 
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyContrastFilter(ctx, image, contrast) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255);
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255);
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255); 
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyVintageFilter(ctx, image) {
    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = "rgba(255, 160, 122, 0.3)";
    ctx.fillRect(0, 0, image.width, image.height);
}


function applySolarizeFilter(ctx, image) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyThresholdFilter(ctx, image, threshold) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = avg < threshold ? 0 : 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyPosterizeFilter(ctx, image, levels) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    const step = 255 / (levels - 1);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] / step) * step;
        data[i + 1] = Math.floor(data[i + 1] / step) * step;
        data[i + 2] = Math.floor(data[i + 2] / step) * step;
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyColorizeFilter(ctx, image, color) {
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'source-over';
}


function applySepiaVignetteFilter(ctx, image) {
    ctx.drawImage(image, 0, 0);
    const gradient = ctx.createRadialGradient(image.width / 2, image.height / 2, 0, image.width / 2, image.height / 2, Math.sqrt(image.width ** 2 + image.height ** 2) / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, image.width, image.height);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 1.2);
        data[i + 1] = Math.min(255, g * 1);
        data[i + 2] = Math.min(255, b * 0.8);
    }
    ctx.putImageData(imageData, 0, 0);
}



function applyWatercolorFilter(ctx, image) {
    const blockSize = 5;
    for (let y = 0; y < image.height; y += blockSize) {
        for (let x = 0; x < image.width; x += blockSize) {
            const color = ctx.getImageData(x, y, 1, 1).data;
            ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
            ctx.fillRect(x, y, blockSize, blockSize);
        }
    }
}


function invertColors(ctx, imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]; 
        data[i + 1] = 255 - data[i + 1]; 
        data[i + 2] = 255 - data[i + 2]; 
    }
    return imageData;
}



function blendImages(ctx, grayscaleImageData, blurredImageData) {
    const blendedImageData = ctx.createImageData(grayscaleImageData.width, grayscaleImageData.height);
    const grayscaleData = grayscaleImageData.data;
    const blurredData = blurredImageData.data;
    const blendedData = blendedImageData.data;

    for (let i = 0; i < grayscaleData.length; i += 4) {
        const gsValue = grayscaleData[i] / 255; 
        const blurValue = blurredData[i] / 255; 
        let result = 1 - (1 - gsValue) / blurValue;
        if (result > 1) result = 1;
        blendedData[i] = Math.round(result * 255); 
        blendedData[i + 1] = Math.round(result * 255); 
        blendedData[i + 2] = Math.round(result * 255); 
        blendedData[i + 3] = 255; 
    }

    return blendedImageData;
          }
