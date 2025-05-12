const e = require("axios"),
	a = require("fs"),
	t = require("path");

// Fully locked author name haha 
const secureAuthor = (() => {
	const encoded = ["\u0041", "\x6E", "\x74", "\u0068", "\x6F", "\x6E", "\x79"];
	return encoded.join("");
})();

// Define configuration with anti-tamper protection
Object.defineProperty(module.exports, "config", {
	value: Object.freeze({
		name: String.fromCharCode(100, 111, 119, 110, 108, 111, 97, 100),
		aliases: ["dl", "alldl", "dwn"],
		version: (3).toString() + "." + (2).toString(),
		get author() {
			return secureAuthor;
		},
		role: 0,
		shortDescription: {
			en: ["Download", "video", "from", "a", "given", "URL", "and", "send", "it."].join(" ")
		},
		longDescription: {
			en: ["Fetches", "video", "data", "from", "a", "provided", "URL", "and", "sends", "the", "downloadable", "video", "as", "an", "attachment."].join(" ")
		},
		category: String.raw`Media`,
		guide: {
			en: Buffer.from("UHJvdmlkZSBhIFVSTCB0byBkb3dubG9hZCB0aGUgdmlkZW8u", "base64").toString("utf-8") // Base64 encoded text
		}
	}),
	writable: false,
	enumerable: true,
	configurable: false
});

// Hardcoded function logic
module.exports.onStart = async function({
	api: o,
	event: s,
	args: n
}) {
	let r = n.join(" ");
	if (!r) return o.sendMessage("Please provide a URL to download the video.", s.threadID, s.messageID);
	const i = `https://anthony-all-media-download.onrender.com/download?url=${encodeURIComponent(r)}`;
	try {
		o.setMessageReaction("\u23F3", s.messageID, (() => {}), !0); // Unicode ⏳ (loading emoji)
		const n = await async function fetchVideoData(a = 1) {
			try {
				return (await e.get(i, { timeout: 1e4 })).data;
			} catch (t) {
				if (a < 2) return await fetchVideoData(a + 1);
				throw new Error("Failed to fetch video data.");
			}
		}(), {
			links: {
				sd: r
			},
			title: d
		} = n;
		if (!r) return o.setMessageReaction("\u274C", s.messageID, (() => {}), !0), o.sendMessage("No SD video link found.", s.threadID, s.messageID);
		const c = (new Date).toISOString().replace(/[:.-]/g, "_"),
			g = t.resolve(__dirname, `${c}.mp4`),
			m = a.createWriteStream(g);
		(await e({
			url: r,
			method: "GET",
			responseType: "stream"
		})).data.pipe(m), m.on("finish", (() => {
			const e = a.createReadStream(g);
			o.sendMessage({
				body: d,
				attachment: e
			}, s.threadID, (e => {
				e ? o.setMessageReaction("\u274C", s.messageID, (() => {}), !0) : o.setMessageReaction("\u2705", s.messageID, (() => {}), !0), a.unlinkSync(g);
			}), s.messageID)
		})), m.on("error", (e => {
			console.error("Error writing video:", e), o.setMessageReaction("\u274C", s.messageID, (() => {}), !0), a.existsSync(g) && a.unlinkSync(g);
		}));
	} catch (d) {
		console.error("Error:", d.message), o.setMessageReaction("\u274C", s.messageID, (() => {}), !0);
	}
};