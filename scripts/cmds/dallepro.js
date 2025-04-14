const axios = require('axios');
const baseApiUrl = async () => {
  return "https://www.noobs-api.rf.gd/dipto";
};
module.exports = {
  config: {
    name: "dallepro",
    aliases: ["bingpro", "createpro", "imagpro"],
    version: "1.0",
    author: "Dipto",
    countDown: 15,
    role: 2,
    description: "Generate images by Unofficial Dalle3",
    category: "download",
    guide: { en: "{pn} prompt" }
  }, 
  onStart: async({ api, event, args }) => {
    const prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
    if (!prompt) return api.sendMessage("❌| Wrong Format. ✅ | Use: 17/18 years old boy/girl watching football match on TV with 'Nisan' and '6t9' written on the back of their dress, 4k", event.threadID, event.messageID);
    try {
       //const cookies = "cookies here (_U value)";
const cookies = ["1pepCaNKx8giFxW4b0qPDGhV_vGZWdmSAucsXse6tcC_jfllHKPVdUMzaL3k_WHvtUdGq4JMjQbM_OjZBvJdoozWx-5mz5uVZhcwTsiYkFQW1Neo_UdBQDaMer-yfmoL2J-0hW5DG6VZ14JUQTQYbKT0z_emSZgi4BGA0dhDE-_Op4R43Va5gcwVJ79Nms3nZyyOSSZQYSs9q3gfVUIU9KA"];
const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];
      const wait = api.sendMessage("Plz Wait baby 😽", event.threadID);
      const response = await axios.get(`${await baseApiUrl()}/dalle?prompt=${prompt}&key=dipto008&cookies=${randomCookie}`);
const imageUrls = response.data.imgUrls || [];
      if (!imageUrls.length) return api.sendMessage("Empty response or no images generated.", event.threadID, event.messageID);
      const images = await Promise.all(imageUrls.map(url => axios.get(url, { responseType: 'stream' }).then(res => res.data)));
    api.unsendMessage(wait.messageID);
   api.sendMessage({ body: `✅ | Here's Your Generated Dallepro Photo 😘`, attachment: images }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`Generation failed!\nError: ${error.message}`, event.threadID, event.messageID);
    }
  }
}
