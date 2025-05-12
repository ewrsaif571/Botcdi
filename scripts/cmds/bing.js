const fs = require("fs");

const path = require("path");

const axios = require("axios");

module.exports = {

  config: {

    name: "bing",

    author: "Noobs Romim",

    category: "image generator"

  },

  onStart: async ({ args, message,api,event }) => {

    const prompt = args.join(" ");

    let b = ["1cuJ6q4TRFe7Egf6fIrFrNgv9tFg5Y9acTNNUBT5xF5Wjc8zd9Gk_AE4eayxHM0IJxWLs0ps-SLhC3INkQGXGTn_W_soDBo75SCm2T43C8NzMXoioD11gf3S1ozmnWBq60DfoqqETjfwhptmCIUqIphRM0BrcQ-Bg1ZTq2Mm-nbejkrgvImWVQjSk5GJi79AiOSIfMGdEFZIIEP15psg7FB2z6abGQkGynsNrh-3DuFM"];

    

  try{

      const loadingMsg = await message.reply("⏳ Generating image, please wait...");

      const axiosRequest = await axios.get(

        `https://www.noobz-api.rf.gd/api/bing?prompt=${prompt}&cookie=${b}`

      );

      const images = axiosRequest.data.images.map(img => img.url);

      if (images.length === 0) {

      message.reply("⚠️ No image found!");

      }

      const pathName = path.join(__dirname, "downloads");

      if (!fs.existsSync(pathName)) {

        fs.mkdirSync(pathName);

      }

      const dwn = await Promise.all(

        images.map(async (url, index) => {

          const filePath = path.join(pathName, `image_${index + 1}.jpg`);

          const response = await axios.get(url, { responseType: "stream" });

          const writer = fs.createWriteStream(filePath);

          response.data.pipe(writer);

          return new Promise((resolve, reject) => {

            writer.on("finish", () => resolve(filePath));

            writer.on("error", reject);

          });

        })

      );

      const attachments = dwn.map((file) => fs.createReadStream(file));

      await message.reply({

        body: `🎨 Generated Images for: ${prompt}`,

        attachment: attachments

      });

      if (loadingMsg) {

        await message.unsend(loadingMsg.messageID);

      }

      dwn.forEach(file => fs.unlinkSync(file));

    } catch (error) {

      message.reply("❌ Error");

    }

  }

};
