const Canvas = require("canvas");
const { randomString } = global.utils;
const fs = require("fs");
const path = require("path");

const defaultFontName = "BeVietnamPro-SemiBold";
const defaultPathFontName = `${__dirname}/assets/font/BeVietnamPro-SemiBold.ttf`;
Canvas.registerFont(`${__dirname}/assets/font/BeVietnamPro-Bold.ttf`, {
    family: "BeVietnamPro-Bold"
});
Canvas.registerFont(defaultPathFontName, {
    family: defaultFontName
});

module.exports = {
    config: {
        name: "richuser",
        version: "1.0",
        author: "Vex_Kshitiz",
        countDown: 5,
        role: 0,
        description: {
            vi: "top 5 rich users ",
            en: "View the top 5 richest users in the group."
        },
        category: "rank",
        guide: {
            vi: "{pn}",
            en: "{pn}"
        }
    },

    onStart: async function ({ message, usersData, threadsData, event, api }) {
        const allUser = await usersData.getAll();
        allUser.sort((a, b) => b.money - a.money);

        const top5Users = allUser.slice(0, 5);
        const richCards = await Promise.all(top5Users.map(async user => {
            const userID = user.userID;
            return await makeRichCard(userID, usersData, threadsData, event.threadID, api);
        }));

        const canvas = Canvas.createCanvas(2000, 500 * 5);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < richCards.length; i++) {
            const img = await Canvas.loadImage(richCards[i]);
            ctx.drawImage(img, 0, i * 500, 2000, 500);
        }

        const buffer = canvas.toBuffer();
        const filePath = path.join(__dirname, 'cache', `${randomString(10)}.png`);

        fs.writeFileSync(filePath, buffer);
        return message.reply({
            attachment: fs.createReadStream(filePath)
        });
    }
};

async function makeRichCard(userID, usersData, threadsData, threadID, api) {
    const { money } = await usersData.get(userID);

    const allUser = await usersData.getAll();
    allUser.sort((a, b) => b.money - a.money);
    const rank = allUser.findIndex(user => user.userID == userID) + 1;

    const customRichCard = await threadsData.get(threadID, "data.customRichCard") || {};
    const dataRich = {
        money,
        name: allUser[rank - 1].name,
        rank: `#${rank}/${allUser.length}`,
        avatar: await usersData.getAvatarUrl(userID)
    };

    const configRichCard = {
        widthCard: 2000,
        heightCard: 500,
        main_color: "#474747",
        sub_color: "rgba(255, 255, 255, 0.5)",
        alpha_subcard: 0.9,
        money_color: "#FFD700",
        text_color: "#000000",
        border_color: rank === 1 ? "#FFD700" : "#00FF00",
        glowing: rank === 1,
        ...customRichCard
    };

    return await drawRichCard(configRichCard, dataRich);
}

async function drawRichCard(config, data) {
    const {
        widthCard,
        heightCard,
        main_color,
        sub_color,
        alpha_subcard,
        money_color,
        text_color,
        border_color,
        glowing
    } = config;

    const {
        money,
        name,
        rank,
        avatar
    } = data;

    const canvas = Canvas.createCanvas(widthCard, heightCard);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = main_color;
    ctx.fillRect(0, 0, widthCard, heightCard);

    ctx.globalAlpha = alpha_subcard;
    ctx.fillStyle = sub_color;
    ctx.fillRect(50, 50, widthCard - 100, heightCard - 100);
    ctx.globalAlpha = 1.0;

    ctx.lineWidth = 10;
    ctx.strokeStyle = border_color;
    if (glowing) {
        ctx.shadowColor = border_color;
        ctx.shadowBlur = 20;
    }
    ctx.strokeRect(50, 50, widthCard - 100, heightCard - 100);

    const avatarImage = await Canvas.loadImage(avatar);
    const avatarSize = 200;
    const avatarX = 60;
    const avatarY = heightCard / 2 - avatarSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.lineWidth = 10;
    ctx.strokeStyle = border_color;
    if (glowing) {
        ctx.shadowColor = border_color;
        ctx.shadowBlur = 20;
    }
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = text_color;
    ctx.font = '50px "BeVietnamPro-Bold"';
    ctx.fillText(name, 300, 200);

    ctx.fillStyle = text_color;
    ctx.font = '40px "BeVietnamPro-SemiBold"';
    ctx.fillText(rank, 300, 275);

    ctx.fillStyle = money_color;
    ctx.font = '40px "BeVietnamPro-SemiBold"';
    ctx.fillText(`Money: ${money}`, 300, 350);

    ctx.strokeStyle = text_color;
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.lineTo(widthCard - 100, 300);
    ctx.stroke();

    return canvas.toBuffer();
}