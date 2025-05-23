const fs = require("fs");
const path = require("path");

const roastListPath = path.join(__dirname, "../kamlalist.json");
const togglePath = path.join(__dirname, "../kamlaToggle.json");

let lastUsedRoast = "";

const roasts = [
  "তোর চেহারা দেখলে আয়নাও আত্মহত্যা করে!",
  "তুই এত বোকা, তোকে দেখলে গাধাও লজ্জা পায়!",
  "তোর মগজে ধূলা জমে আছে!",
  "তুই জন্ম নেস, কিন্তু ব্রেইন আনতে ভুলে গেস!",
  "তোর IQ দিয়ে তো বাল্বও জ্বলবে না!",
  "তোর কথা শুনে মনে হয় WiFi ছাড়া কানেকশন!",
  "তুই হলি কামলার শীর্ষ প্রতিনিধি!",
  "তোর মুখে কইরা তো ভদ্রতাও লজ্জা পায়!",
  "তোর ফ্যান ফলোয়ার আছে, কিন্তু সবাই বোকা হইছে!",
  "তুই যতো বলিস, ততো হাসির খোরাক!",
  "তোর উপস্থিতি মানেই বুদ্ধির অপমান!",
  "তুই গুগলে সার্চ দিলেও উত্তর পাওয়া যায় না!",
  "তোর লজিকে সাগরও শুকায়!",
  "তুই এত ফালতু, তোকে নিয়া জোকস লেখা যায়!",
  "তোর মাথার ভিতরে কুমির ড্যান্স করে!",
  "তুই যে মুরগি, তাও ইনস্টাগ্রাম চালাস!",
  "তোর পোস্টে লাইক পড়ে করুণা দেখায়া!",
  "তুই আর তোর হালকা ব্রেইন – পুরা কম্বো!",
  "তোর মতো কামলার জন্য AI-ও হাল ছাইড়ে দিছে!",
  "তোর উপর roast করাও সময়ের অপচয়!",
  "তুই হাসলে লোকে বাচ্চারে ভয় দেখায়!",
  "তুই স্ট্যাটাস দিলে শব্দরাও আত্মহত্যা করে!",
  "তোরে Block করা দরকার ছিল জন্মের সময়ই!",
  "তুই হলি মেন্টাল হাসপাতালের চ্যাম্পিয়ন!",
  "তুই চুপি চুপি টিকটক বানাস, তারপর সেলাই করাস!",
  "তোর চিন্তাধারা পুরান Nokia 1100 এর মত slow!",
  "তোর মতো কামলা দেখে গরুও বেগুনি হয়ে যায়!",
  "তোর বুদ্ধিতে পানি ঢাললেও ফোটা ফুটে না!",
  "তুই এত কামলা, তোকে নিয়া কোর্স করানো যায়!",
  "তুই ফেইসবুকে স্ট্যাটাস দিলে কবিতা লজ্জা পায়!",
  "তোর চোখে মিথ্যা কথা লেখা থাকে!",
  "তুই মঞ্চে উঠলে স্পটলাইট পালায়!",
  "তুই যদি রোবট হইতিস, উইন্ডোজও ক্রাশ করত!",
  "তুই হলি ভাইরাল না, বিরক্তিকর!",
  "তোরে নিয়া Netflix সিরিজ বানানো যায়!",
  "তোর ব্রেইন দেখে কম্পিউটার হাসে!",
  "তুই হাসলে বাচ্চারা কান্না থামে!",
  "তোর অ্যাটিচিউড ফাঁকা কলসির মতো!",
  "তুই joke করিস, কিন্তু joke তুই নিজেই!",
  "তুই এত কামলা, বাইরের গরুও তোরে চিনে!",
  "তোরে roast করা মানে সময়ের অপচয়!",
  "তুই যদি ফোন হইতিস, ১% চার্জেও কাজ করত না!",
  "তুই GIF হলেও লোড হইত না!",
  "তোর উপর Meme বানাইলে ভাইরাল হইব!",
  "তুই হইলা কার্টুনেরও কার্টুন!",
  "তোরে দিয়ে হাঁসির প্যাকেট বানাইতে পারি!",
  "তুই মাটি ছুঁইলে গাছও মরতে শুরু করে!",
  "তুই আইকিউ না, I Quit!",
  "তুই রিচার্জ ছাড়া জ্ঞান দিস!",
  "তোরে দিয়ে কমেডি নাটক বানালে নোবেল পাওয়া যাইত!",
  "তোরে দেখলে TikTok-ও uninstall হয়!",
  "তুই এমন কামলা, বালিশও তোরে অপমান করে!"
];

function loadToggle() {
  if (!fs.existsSync(togglePath)) fs.writeFileSync(togglePath, JSON.stringify({ enabled: true }));
  return JSON.parse(fs.readFileSync(togglePath)).enabled;
}

function saveToggle(value) {
  fs.writeFileSync(togglePath, JSON.stringify({ enabled: value }));
}

module.exports = {
  config: {
    name: "kamla",
    version: "2.0",
    author: "rifat",
    role: 0,
    shortDescription: "Auto roast users from kamlalist, toggleable",
    longDescription: "Roasts users automatically from kamlalist. Can be turned on/off.",
    category: "fun",
    guide: {
      en: "{p}kamla on\n{p}kamla off"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args[0]?.toLowerCase();
    if (input === "on") {
      saveToggle(true);
      return api.sendMessage("✅ | Kamla roast চালু হয়েছে।", event.threadID);
    } else if (input === "off") {
      saveToggle(false);
      return api.sendMessage("❌ | Kamla roast বন্ধ করা হয়েছে।", event.threadID);
    } else {
      return api.sendMessage("ℹ️ | ব্যবহার:\n/kamla on – চালু করতে\n/kamla off – বন্ধ করতে", event.threadID);
    }
  },

  onChat: async function ({ api, event }) {
    const enabled = loadToggle();
    if (!enabled) return;

    if (!fs.existsSync(roastListPath)) fs.writeFileSync(roastListPath, JSON.stringify([]));
    const kamlas = JSON.parse(fs.readFileSync(roastListPath));

    if (!kamlas.includes(event.senderID)) return;

    let roast;
    do {
      roast = roasts[Math.floor(Math.random() * roasts.length)];
    } while (roast === lastUsedRoast && roasts.length > 1);

    lastUsedRoast = roast;

    api.sendMessage(roast, event.threadID, event.messageID);
  }
};