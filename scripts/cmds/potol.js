const axios = require("axios");
const { Readable } = require("stream");

module.exports.config = {
  name: "potol",
  version: "1.0",
  role: 0,
  author: "AYANOKŌJI ",
  description: "PepeXL Image Generator",
  category: "image",
  premium: true,
  guide: "{pn} [prompt]\nExample: {pn} funny pepe meme",
  countDown: 15,
};

module.exports.onStart = async ({ event, args, api }) => {
  const pepexlApi = "https://renzweb.onrender.com/api/pepexl";
  const apiKey = "c464f0a755e3f21fc9dad5a3ae1bfd2b";

  try {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("Please provide a prompt for the image generation.", event.threadID, event.messageID);
    }

    const startTime = Date.now();
    const waitMessage = await api.sendMessage("𝐺𝑒𝑛𝑒𝑟𝑎𝑡𝑖𝑛𝑔, 𝑝𝑙𝑒𝑎𝑠𝑒 𝑤𝑎𝑖𝑡...🪄", event.threadID);
    api.setMessageReaction("🌟", event.messageID, () => {}, true); // New reaction for processing

    const apiUrl = `${pepexlApi}?prompt=${encodeURIComponent(prompt)}&apiKey=${encodeURIComponent(apiKey)}`;
    console.log(`Requesting: ${apiUrl}`);

    const response = await axios.get(apiUrl, { responseType: "json" });
    console.log("Full Response:", {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    let imageStream;
    if (response.data && typeof response.data === "object") {
      const url = response.data.imageUrl || response.data.url || response.data.image || response.data.result;
      if (url && typeof url === "string") {
        console.log("Fetching image from URL:", url);
        imageStream = (await axios.get(url, { responseType: "stream" })).data;
      } else if (response.data.image && response.data.image.startsWith("data:image")) {
        console.log("Processing base64 image");
        const base64Data = response.data.image.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        imageStream = Readable.from(buffer);
      } else {
        const rawResponse = JSON.stringify(response.data, null, 2);
        throw new Error(`No recognizable image URL or data in response. Raw response:\n${rawResponse}`);
      }
    } else if (typeof response.data === "string" && response.data.startsWith("http")) {
      console.log("Fetching image from plain text URL:", response.data);
      imageStream = (await axios.get(response.data, { responseType: "stream" })).data;
    } else if (response.headers["content-type"]?.includes("image")) {
      console.log("Processing direct image response");
      imageStream = (await axios.get(apiUrl, { responseType: "stream" })).data;
    } else {
      const rawResponse = typeof response.data === "object" 
        ? JSON.stringify(response.data, null, 2) 
        : String(response.data);
      throw new Error(`Unexpected response format. Raw response:\n${rawResponse}`);
    }

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    api.setMessageReaction("🎉", event.messageID, () => {}, true); // New reaction for success
    api.unsendMessage(waitMessage.messageID);

    // Send initial quick response
    await api.sendMessage(
      `PepeXL process completed ✨\n\n𝐺𝑒𝑛𝑒𝑟𝑎𝑡𝑒𝑑 𝑖𝑛 ${timeTaken} 𝑠𝑒𝑐𝑜𝑛𝑑𝑠`,
      event.threadID
    );

    // Send image
    api.sendMessage(
      {
        body: "Here’s your generated Pepe image:",
        attachment: imageStream,
      },
      event.threadID,
      event.messageID
    );

  } catch (e) {
    console.error("Error Details:", {
      message: e.message,
      response: e.response ? {
        status: e.response.status,
        data: e.response.data,
        headers: e.response.headers
      } : "No response data"
    });
    
    let errorMessage = "An error occurred while generating the image.";
    if (e.response && e.response.status === 404) {
      errorMessage = "API endpoint not found (404). Please verify 'pepexl' is the correct endpoint.";
    } else if (e.message) {
      errorMessage = `Error: ${e.message}`;
    }

    api.setMessageReaction("😢", event.messageID, () => {}, true); // New reaction for error
    api.unsendMessage(waitMessage.messageID);
    api.sendMessage(errorMessage, event.threadID, event.messageID);
  }
};
