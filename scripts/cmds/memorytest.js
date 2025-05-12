module.exports = {
  config: {
    name: "memorytest",
    aliases: ["mt"],
    version: "1.0",
    author: "Kshitiz",
    role: 0,
    shortDescription: "heyyyyy dont do copy paste",
    longDescription: "test your memory power ",
    category: "fun",
    guide: {
      en: "{p}memorytest"
    }
  },

  onStart: async function ({ message }) {
    const emojiSequence = generateHardEmojiSequence(); 
    const originalSequence = generateEmojiMessage(emojiSequence); 
    try {
      const sentMessage = await message.reply(`𝙍𝙚𝙢𝙚𝙢𝙗𝙚𝙧 𝙩𝙝𝙞𝙨 𝙨𝙚𝙦𝙪𝙚𝙣𝙘𝙚: ${originalSequence}`);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author: message.senderID,
        originalSequence: originalSequence,
        tempFilePath: null
      });
      setTimeout(async () => {
        try {
          await message.unsend(sentMessage.messageID);
        } catch (error) {
          console.error("Error while unsending first message:", error);
        }
        const newEmojiSequence = generateHardEmojiSequence();
        const replyMessage = await message.reply(`𝙍𝙚𝙥𝙡𝙮 𝙩𝙝𝙞𝙨 𝙢𝙚𝙨𝙨𝙖𝙜𝙚\n𝙗𝙮 𝙛𝙞𝙧𝙨𝙩 𝙚𝙢𝙤𝙟𝙞 𝙨𝙚𝙦𝙪𝙚𝙣𝙘𝙚`);
        global.GoatBot.onReply.set(replyMessage.messageID, {
          commandName: this.config.name,
          messageID: replyMessage.messageID,
          author: message.senderID,
          originalSequence: originalSequence, 
          tempFilePath: null
        });
        setTimeout(async () => {
          try {
            await message.unsend(replyMessage.messageID);
          } catch (error) {
            console.error("Error while unsending second reply message:", error);
          }
        }, 180000);
      }, 5000); 
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const repliedMessage = event.body;
    if (!isValidEmojiSequence(repliedMessage)) {
    
      await message.reply("𝙂𝙤 𝙩𝙤 𝙈𝙚𝙣𝙩𝙖𝙡 𝙝𝙤𝙨𝙥𝙞𝙩𝙖𝙡 𝙗𝙧𝙤");
      return;
    }
    const originalSequence = Reply.originalSequence;  
    await message.reply(`𝘾𝙝𝙚𝙘𝙠 𝙮𝙤𝙪𝙧 𝙢𝙚𝙢𝙤𝙧𝙮 𝙥𝙤𝙬𝙚𝙧.\n𝙔𝙤𝙪𝙧 𝙚𝙢𝙤𝙟𝙞𝙨: ${repliedMessage}\n& 𝙁𝙞𝙧𝙨𝙩 𝙚𝙢𝙤𝙟𝙞 𝙨𝙚𝙦𝙪𝙚𝙣𝙘𝙚: ${originalSequence}`);
    setTimeout(async () => {
      try {
        await message.unsend(event.messageID);
      } catch (error) {
        console.error("Error while unsending message:", error);
      }
    }, 180000);

  
    const { commandName } = Reply;
    if (commandName === this.config.name) {
      const { messageID } = Reply;
      try {
        await message.unsend(messageID);
      } catch (error) {
        console.error("Error while unsending second reply message:", error);
      }
    }
  }
};


function generateHardEmojiSequence() {
  const emojis = ["😁", "😋", "😊", "😎", "😄", "😃", "😆", "😉", "😅", "😍", "😘", "😚", "😙", "😗", "😛", "😜", "😝", "😌", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😢", "😭", "😤", "😪", "😥", "😰", "😩", "😫", "😨", "😱", "😠", "😡", "😤", "😖", "😆", "😋", "😷", "😎", "😴", "😵", "😲", "🤐", "😷", "🤒", "🤕", "😈", "👿", "👹", "👺", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🤲", "👐", "🙌", "👏", "🤝", "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦵", "🦶", "🖕", "✍️", "🤳", "💅", "👄", "👅", "👂", "👃", "👁️", "👀", "🧠", "👤", "👥", "🗣️", "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👱", "👱‍♀️", "👱‍♂️", "🧔", "👵", "🧓", "👴", "👲", "👳", "👳‍♀️", "👳‍♂️", "🧕", "👮", "👮‍♀️", "👮‍♂️", "👷", "👷‍♀️", "👷‍♂️", "💂", "💂‍♀️", "💂‍♂️", "🕵️", "🕵️‍♀️", "🕵️‍♂️", "👩‍⚕️", "👨‍⚕️", "👩‍🎓", "👨‍🎓", "👩‍🏫", "👨‍🏫", "👩‍⚖️", "👨‍⚖️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🔧", "👨‍🔧", "👩‍🏭", "👨‍🏭", "👩‍💼", "👨‍💼", "👩‍🔬", "👨‍🔬", "👩‍💻", "👨‍💻", "👩‍🎤", "👨‍🎤", "👩‍🎨", "👨‍🎨", "👩‍✈️", "👨‍✈️", "👩‍🚀", "👨‍🚀", "👩‍🚒", "👨‍🚒", "👩‍🦯", "👨‍🦯", "👩‍🦼", "👨‍🦼", "👩‍🦽", "👨‍🦽", "🧑‍🦽", "🧑‍🦼", "🧑‍🦯", "🧑‍🚒", "🧑‍🚀", "🧑‍🎨", "🧑‍🎤", "🧑‍🎓", "🧑‍💻", "🧑‍💼", "🧑‍🔬", "🧑‍🔧", "🧑‍🏭", "🧑‍🏫", "🧑‍🌾", "🧑‍🍳", "🧑‍🍼", "🧑‍⚕️", "🧑‍⚖️", "🧑‍✈️", "🧑‍🚀", "🧑‍🚒", "🧑‍🦯", "🧑‍🦼", "🧑‍🦽", "🧑‍🦲", "👰", "🤵", "👸", "🤴", "🥷", "🦸", "🦸‍♀️", "🦸‍♂️", "🦹", "🦹‍♀️", "🦹‍♂️", "🤶", "🧑‍🎄", "🎅", "🧙", "🧙‍♀️", "🧙‍♂️", "🧝", "🧝‍♀️", "🧝‍♂️", "🧚", "🧚‍♀️", "🧚‍♂️", "🧞", "🧞‍♀️", "🧞‍♂️", "🧜", "🧜‍♀️", "🧜‍♂️", "🧛", "🧛‍♀️", "🧛‍♂️", "🧟", "🧟‍♀️", "🧟‍♂️", "💆", "💆‍♀️", "💆‍♂️", "💇", "💇‍♀️", "💇‍♂️", "🚶", "🚶‍♀️", "🚶‍♂️", "🧍", "🧍‍♀️", "🧍‍♂️", "👯", "👯‍♀️", "👯‍♂️", "🧖", "🧖‍♀️", "🧖‍♂️", "👩‍🦰", "🧑‍🦰", "👨‍🦰", "👩‍🦱", "🧑‍🦱", "👨‍🦱", "👩‍🦳", "🧑‍🦳", "👨‍🦳", "👩‍🦲", "🧑‍🦲", "👨‍🦲", "🧔", "👱", "👱‍♀️", "👱‍♂️", "🧑‍🦱", "🧑‍🦰", "🧑‍🦳", "🧑‍🦲", "🧑‍🎄", "👩‍🎄", "👨‍🎄", "🧑‍🎨", "👩‍🎨", "👨‍🎨", "🧑‍🚀", "👩‍🚀", "👨‍🚀", "🧑‍🚒", "👩‍🚒", "👨‍🚒", "🧑‍✈️", "👩‍✈️", "👨‍✈️", "🧑‍🚒", "👩‍🚒", "👨‍🚒", "👩‍⚕️", "👨‍⚕️", "🧑‍⚕️", "👩‍🌾", "👨‍🌾", "🧑‍🌾", "👩‍🍳", "👨‍🍳", "🧑‍🍳", "👩‍🎓", "👨‍🎓", "🧑‍🎓", "👩‍🏫", "👨‍🏫", "🧑‍🏫", "👩‍🏭", "👨‍🏭", "🧑‍🏭", "👩‍💻", "👨‍💻", "🧑‍💻", "👩‍💼", "👨‍💼", "🧑‍💼", "👩‍🔧", "👨‍🔧", "🧑‍🔧", "👩‍🔬", "👨‍🔬", "🧑‍🔬", "👩‍🎨", "👨‍🎨", "🧑‍🎨", "👩‍🚒", "👨‍🚒", "🧑‍🚒", "👩‍🚀", "👨‍🚀", "🧑‍🚀", "👩‍⚖️", "👨‍⚖️", "🧑‍⚖️", "👩‍🚵‍♀️", "👨‍🚵‍♀️", "🧑‍🚵‍♀️", "👩‍🚵‍♂️", "👨‍🚵‍♂️", "🧑‍🚵‍♂️", "👩‍🏊‍♀️", "👨‍🏊‍♀️", "🧑‍🏊‍♀️", "👩‍🏊‍♂️", "👨‍🏊‍♂️", "🧑‍🏊‍♂️", "👩‍🦽", "👨‍🦽", "🧑‍🦽", "👩‍🦼", "👨‍🦼", "🧑‍🦼", "👩‍🦯", "👨‍🦯", "🧑‍🦯", "👩‍🦺", "👨‍🦺", "🧑‍🦺", "👩‍🦯", "👨‍🦯", "🧑‍🦯", "👩‍🦳", "👨‍🦳", "🧑‍🦳", "👩‍🦲", "👨‍🦲", "🧑‍🦲", "👩‍🦰", "👨‍🦰", "🧑‍🦰", "👩‍🦱", "👨‍🦱", "🧑‍🦱", "👩‍🦲", "👨"];
  const randomEmojis = [];
  for (let i = 0; i < 5; i++) { 
    const randomIndex = Math.floor(Math.random() * emojis.length);
    randomEmojis.push(emojis[randomIndex]);
    emojis.splice(randomIndex, 1); 
  }
  return randomEmojis;
}


function isValidEmojiSequence(message) {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
  return emojiRegex.test(message);
}


function generateEmojiMessage(emojis) {
  return emojis.join("");
                 }
