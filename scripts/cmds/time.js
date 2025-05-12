const axios = require('axios');



module.exports = {

  config: {

    name: "time",

    version: "1.0",

    author: "Romeo",

    countDown: 5,

    role: 0,

    shortDescription: "Fetches the current time for a specified location",

    longDescription: "This command fetches the current time for a specified location using the IPGeolocation API. Use the command with a location name or coordinates.",

    category: "information",

    guide: {

      vi: '',

      en: "{pn}time <country name>"

    }

  },



  onStart: async function ({ api, event, message, args }) {

    const threadID = event.threadID;

    const messageID = event.messageID;

    const apiKey = '44af5583113741a38e71284bdf53e63b'; // API key for IPGeolocation API

    const location = args.join(' '); // Get location from arguments



   

    if (!location) {

      return api.sendMessage("Please provide a location. Example: 'New York', 'London', 'Tokyo'", threadID, messageID);

    }



    const url = `https://api.ipgeolocation.io/timezone?apiKey=${apiKey}&location=${encodeURIComponent(location)}`;



    try {

      

      const response = await axios.get(url);

      const { date_time_txt, timezone, location: apiLocation } = response.data;



      if (!date_time_txt) {

        return api.sendMessage("Could not retrieve time for the specified location. Please check the location name.", threadID, messageID);

      }



      

      const date = new Date(date_time_txt);

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const dayName = dayNames[date.getUTCDay()];



      let hours = date.getUTCHours();

      const minutes = date.getUTCMinutes();

      const ampm = hours >= 12 ? 'PM' : 'AM';



      hours = hours % 12;

      hours = hours ? hours : 12; // the hour '0' should be '12'

      const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;



      

      const formattedDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;



      

      const responseMessage = `𝗧𝘄𝗶𝗻𝗸𝗹𝗲 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝘁𝗶𝗺𝗲🎀:\n\n` +

        `🕛 𝑇𝑖𝑚𝑒: ${formattedTime}\n` +

        `📅 𝐷𝑎𝑡𝑒: ${formattedDate}\n` +

        `📝 𝐷𝑎𝑦 𝑁𝑎𝑚𝑒: ${dayName}\n` +

        `🕒 𝐿𝑜𝑐𝑎𝑡𝑖𝑜𝑛: ${args.join(' ')}\n` +

        `🌐 𝑇𝑖𝑚𝑒 𝑍𝑜𝑛𝑒: ${timezone}`;



      

      await api.sendMessage(responseMessage, threadID, messageID);



    } catch (error) {

      console.error("Failed to fetch time:", error);

      await api.sendMessage("⚠ | An error occurred while fetching the time.", threadID);

    }

  },

};
