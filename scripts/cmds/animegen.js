const axios = require("axios");
const fs = require("fs");
const path = require("path");

const modelList = [
  { id: "1623151145630711039", name: "Animagine xl 4.0" },
  { id: "1781154718093552203", name: "Celi mix" },
  { id: "1815671157324618220", name: "Coco illustrious noob xl" },
  { id: "1819625091266660254", name: "Coco illustrious noob xl 2" },
  { id: "1825497827979034361", name: "Coco illustrious noob xl 3" },
  { id: "1636498865710592407", name: "Pixar" },
  { id: "1869108561160475178", name: "Hinatav2" },
  { id: "1871375247354917836", name: "Illustrious 2" },
  { id: "1879395214942859316", name: "ikastrious" },
  { id: "1880543481272969369", name: "I5" },
  { id: "1880723819333427624", name: "NAL" },
  { id: "1641032326734854197", name: "Niji diffused" },
  { id: "1830737069924162722", name: "Noobai xl" },
  { id: "1854274015540572126", name: "Otome 1" },
  { id: "1856956435031440023", name: "Otome 2" },
  { id: "1640869892656551730", name: "Ouka niji 5" },
  { id: "1718828002177085642", name: "Pony diffusion" },
  { id: "1728448411850319091", name: "Real pony" },
  { id: "1701440086941361361", name: "Artist realistic xl" },
  { id: "1634346681782655348", name: "Cyber realistic" },
  { id: "1644554003493650259", name: "Epic realism" },
  { id: "1670967182742733036", name: "New reality xl" },
  { id: "1651009645318648901", name: "Reality vision 5" }
];

module.exports = {
  config: {
    name: "animegen",
    aliases: [],
    version: "1.0",
    author: "MarianCross",
    countDown: 10,
    role: 0,
    shortDescription: "Génère une image animée ou réaliste",
    longDescription: "Utilise un modèle animé ou réaliste (numéroté de 1 à 23) pour générer une image selon ton prompt.",
    category: "image",
    guide: "{pn} [prompt] | [numéro modèle] | [ratio]\nEx : {pn} fille dans la forêt | 1 | 2:3\nTape {pn} model pour voir la liste des modèles\nTape {pn} info model [numéro] pour les détails\nTape {pn} ratio pour voir les formats"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").toLowerCase().trim();

    if (input === "ratio" || input === "ratios") {
      return api.sendMessage(
        "🎞️ **Ratios valides** :\n\n" +
        "- 1:1 (par défaut)\n- 3:2, 2:3\n- 16:9, 9:16\n- 4:3, 3:4\n- 5:4, 4:5\n- 21:9, 9:21\n- 5:3, 3:5\n- 8:5, 5:8",
        event.threadID
      );
    }

    if (input === "model" || input === "models") {
      let msg = "🧠 **Liste des modèles disponibles** :\n\n";
      modelList.forEach((m, i) => {
        msg += `${i + 1}. ${m.name}\n`;
      });
      return api.sendMessage(msg.trim(), event.threadID);
    }

    if (input.startsWith("info model")) {
      const parts = input.split(" ");
      const index = parseInt(parts[2]) - 1;
      const model = modelList[index];

      if (!model) {
        return api.sendMessage("❌ Modèle introuvable. Tape `anigen model` pour voir la liste.", event.threadID);
      }

      try {
        const res = await axios.get(`https://zaikyoov3-up.up.railway.app/api/model-info/${model.id}`);
        const buffer = (await axios.get(res.data.image, { responseType: "arraybuffer" })).data;

        const imgPath = path.join(__dirname, `model_${event.threadID}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        await api.sendMessage({
          body: `📌 Modèle ${index + 1}: ${model.name}\nID: ${model.id}\nDescription: ${res.data.description || "N/A"}`,
          attachment: fs.createReadStream(imgPath)
        }, event.threadID);
        fs.unlinkSync(imgPath);
      } catch (err) {
        console.error(err);
        api.sendMessage("❌ Impossible de récupérer les infos du modèle.", event.threadID);
      }
      return;
    }

    if (!args[0]) {
      return api.sendMessage("❌ Donne un prompt.\nEx : /anigen chat mignon | 6 | 2:3", event.threadID);
    }

    const split = args.join(" ").split("|");
    const prompt = split[0].trim();
    const modelIndex = parseInt(split[1]?.trim()) - 1;
    const ratio = split[2]?.trim() || "1:1";

    const model = modelList[modelIndex];
    if (!model) {
      return api.sendMessage("❌ Numéro de modèle invalide. Tape /anigen model pour voir les modèles.", event.threadID);
    }

    const loading = await api.sendMessage(`⏳ Génération avec le modèle *${model.name}* (${ratio})...`, event.threadID);

    try {
      const res = await axios.post(
        "https://zaikyoov3-up.up.railway.app/api/sdxl-proxy",
        {
          modelId: model.id,
          prompt: prompt,
          seed: Math.floor(Math.random() * 1000000),
          nsfw: "true",
          ratio: ratio
        },
        { responseType: "arraybuffer" }
      );

      const imgPath = path.join(__dirname, `anigen_${event.threadID}.jpg`);
      fs.writeFileSync(imgPath, res.data);

      await api.sendMessage({
        body: `✅ Image générée avec le modèle *${model.name}* (${ratio})`,
        attachment: fs.createReadStream(imgPath)
      }, event.threadID);

      fs.unlinkSync(imgPath);
      await api.unsendMessage(loading.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Erreur pendant la génération. Vérifie ton prompt, ton modèle ou ton ratio.", event.threadID);
      await api.unsendMessage(loading.messageID);
    }
  }
};