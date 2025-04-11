const { getStreamFromURL } = require("fb-watchman");
module.exports = {
  config: {
    name: "owner",
    version: 2.0,
    author: "Lawkey Marvellous",
    longDescription: "info about bot and owner",
    category: "Special",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const imgURL = " https://i.ibb.co/PjLndnt/image.jpg";
    const attachment = await global.utils.getStreamFromURL(imgURL);

    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;

    const ment = [{ id: id, tag: name }];
    const a = "Nobody 💔";
    const b = " . ";
    const c = "ཐིི Munna ༏ Better Sweet ཋྀ";
const e = "Male";
    const d = "m.me/61560891464600";
const f = "16+";
const g = "Single 💔";
const h = "New 10";
const i = " Dhaka ";

    message.reply({ 
      body: `𒁍۝ Hello ${name} you want to Know more about me and my owner? Command created by ཐིི༏ཋྀ Lawkey Marvellous. ཐིི༏ཋྀ, ۝۝۝=••••  Here is the information ❄️ ••••=۝۝۝



۝💔۝𒁍 Bot's Name: ${a}
۝💔۝𒁍 Bot's prefix: ${b}  
۝💔۝𒁍 Owner: ${c}
۝💔۝𒁍 Gender: ${e}
۝💔۝𒁍 Owners Messenger: ${d}
۝💔۝𒁍 Age: ${f}
۝💔۝𒁍 Relationship: ${g}
۝💔۝𒁍 Class: ${h}
۝💔۝𒁍 Basa: ${i}`,
mentions: ment,
      attachment: attachment });
  }
};
