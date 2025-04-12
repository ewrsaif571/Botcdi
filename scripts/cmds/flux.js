const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");

async function generateImage(prompt, model) {
  try {
    const response = await axios({
      method: "get",
      url: `https://milanbhandari.onrender.com/flux`,
      params: {
        inputs: prompt,
        model,
      },
      responseType: "stream", 
    });
    return response.data; 
  } catch (error) {
    throw new Error("An error occurred while crafting your image. Please try again in a moment.");
  }
}

module.exports = {
  config: {
    name: "imagine", 
    aliases: ["generate", "imagine", "create"], 
    version: "1.3", 
    author: "cxly npx", 
    longDescription: {
      en: `Unleash your creativity and generate mesmerizing images using the Flux API. Choose from a wide range of models to bring your vision to life:
      \n\n1 | 3Guofeng3
      \n2 | Absolutereality_V16
      \n3 | Absolutereality_v181
      \n4 | AmIReal_V41
      \n5 | Analog-diffusion-1.0
      \n6 | Anythingv3_0-pruned
      \n7 | Anything-v4.5-pruned
      \n8 | AnythingV5_PrtRE
      \n9 | AOM3A3_orangemixs
      \n10 | Blazing_drive_v10g
      \n11 | Breakdomain_I2428
      \n12 | Breakdomain_M2150
      \n13 | CetusMix_Version35
      \n14 | ChildrensStories_v13D
      \n15 | ChildrensStories_v1SemiReal
      \n16 | ChildrensStories_v1ToonAnime
      \n17 | Counterfeit_v30
      \n18 | Cuteyukimixadorable_midchapter3
      \n19 | Cyberrealistic_v33
      \n20 | Dalcefo_v4
      \n... (more models available)
      \n\nUse the --model option to specify the model you'd like to use when generating your image.`,
    },
    category: "gen", 
    guide: {
      en: "{pn} <prompt> --model <number>\nExample: {pn} A futuristic city under a neon sky --model 3",
    },
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ").trim();
    message.reaction("🐼", event.messageID); 

    if (!prompt) {
      return message.reply("❌ Please provide a prompt so I can generate a beautiful image for you.");
    }

    const modelMatch = prompt.match(/--model (\d+)/);
    const model = modelMatch ? modelMatch[1] : "1"; 

    if (model < 1 || model > 63) {
      return message.reply("❌ Invalid model number. Please choose a model between 1 and 63.");
    }

    try {
      const mjImage = await generateImage(prompt, model);
      message.reply({
        body: `🌺 Here's the magical visual interpretation of your idea: "${prompt}" using model ${model}`,
        attachment: mjImage, 
      });
      message.reaction("☺️", event.messageID); 
    } catch (error) {
      console.error(error);
      message.reaction("❌", event.messageID); 
      return message.reply(error.message || "Oops! Something went wrong while generating the image. Please try again later.");
    }
  },
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
    
