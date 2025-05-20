const axios = require("axios");
const fs = require("fs");
const path = require("path");

const modelList = [
 { id: "1654186007482363069", name: "Perfect Sketchbook 完美草图" },
 { id: "1734083089201229092", name: "Niji Style XL" },
 { id: "1848500902145805283", name: "NeoBanshee" },
 { id: "1838381803224159290", name: "Vixon's Noob Illust Merge" },
 { id: "1812771363132584161", name: "NTR MIX | illustrious-XL | Noob-XL" },
 { id: "1871375247354917836", name: "Illustrious-XL-V2.0-Stable" },
 { id: "1856964022763541122", name: "Illustrious-XL-v2.0" },
 { id: "1846639214562677924", name: "Illustrious-XL-v1.1" },
 { id: "1844843519625072849", name: "Illustrious-XL-v1.0" },
 { id: "1847543728464212190", name: "A-Illust Nb XL" },
 { id: "1803248400787249642", name: "Yuika" },
 { id: "1873447472456538056", name: "Yuika v2" },
 { id: "1615213053731709479", name: "33-nijiv5style_v10" },
 { id: "1879395214942859316", name: "Ikastrious" }
];

module.exports = {
 config: {
 name: "lazy",
 version: "1.0",
 author: "Renz",
 countDown: 10,
 role: 0,
 shortDescription: "Generate high quality images with different models",
 longDescription: "Use one of 15 powerful models to generate a detailed image. Use *lazy model to see all models.",
 category: "image",
 guide: "{pn} [prompt] --[model number] --ar [ratio]\nExample: {pn} cat in forest --1 --ar 2:3\nUse {pn} model to see model list"
 },

 onStart: async function ({ api, event, args }) {
 const input = args.join(" ").trim();

 if (input.toLowerCase() === "model") {
 let msg = "🧠 Available Models:\n\n";
 modelList.forEach((m, i) => msg += `${i + 1}. ${m.name}\n`);
 return api.sendMessage(msg.trim(), event.threadID);
 }

 if (!input.includes("--")) {
 return api.sendMessage("❌ Invalid format. Use: *lazy [prompt] --[model number] --ar [ratio]\nExample: *lazy cat --1 --ar 1:1", event.threadID);
 }

 const prompt = input.split("--")[0].trim();
 const modelMatch = input.match(/--(\d{1,2})/);
 const ratioMatch = input.match(/--ar\s*(\d+:\d+)/i);

 const modelIndex = modelMatch ? parseInt(modelMatch[1], 10) - 1 : -1;
 const ratio = ratioMatch ? ratioMatch[1] : "1:1";

 if (!prompt) {
 return api.sendMessage("❌ Please provide a prompt.", event.threadID);
 }

 if (modelIndex < 0 || modelIndex >= modelList.length) {
 return api.sendMessage("❌ Invalid model number. Use *lazy model to see the model list.", event.threadID);
 }

 const model = modelList[modelIndex];

 // Create a fixed seed from the prompt text
 const seed = prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

 const loading = await api.sendMessage(`🀄 Generating plz wait 🪩...`, event.threadID);

 try {
 const res = await axios.post(
 "https://zaikyoov3-up.up.railway.app/api/sdxl-proxy",
 {
 modelId: model.id,
 prompt,
 seed,
 nsfw: "true",
 ratio
 },
 { responseType: "arraybuffer" }
 );

 const imgPath = path.join(__dirname, `lazy_${event.threadID}.jpg`);
 fs.writeFileSync(imgPath, res.data);

 await api.sendMessage({
 body: `✅ Image generated using *${model.name}* (${ratio})`,
 attachment: fs.createReadStream(imgPath)
 }, event.threadID);

 fs.unlinkSync(imgPath);
 await api.unsendMessage(loading.messageID);
 } catch (err) {
 console.error(err);
 await api.unsendMessage(loading.messageID);
 return api.sendMessage("❌ Error while generating image. Try again later.", event.threadID);
 }
 }
};