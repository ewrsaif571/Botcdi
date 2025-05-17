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

const deltaNext = 5;

const expToLevel = (exp, deltaNextLevel = deltaNext) => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
const levelToExp = (level, deltaNextLevel = deltaNext) => Math.floor(((Math.pow(level, 2) - level) * deltaNextLevel) / 2);

module.exports = {
    config: {
        name: "ranktop",
        version: "1.0",
        author: "NTKhang",// modified by vex_kshitiz
        countDown: 5,
        role: 0,
        description: {
            vi: "Xem top 5 người có rank cao nhất trong nhóm.",
            en: "View the top 5 highest-ranked users in the group."
        },
        category: "rank",
        guide: {
            vi: "{pn}",
            en: "{pn}"
        }
    },

    onStart: async function ({ message, usersData, threadsData, event, api }) {
        const allUser = await usersData.getAll();
        allUser.sort((a, b) => b.exp - a.exp);

        const top5Users = allUser.slice(0, 5);
        const rankCards = await Promise.all(top5Users.map(async user => {
            const userID = user.userID;
            return await makeRankCard(userID, usersData, threadsData, event.threadID, api);
        }));

        const canvas = Canvas.createCanvas(2000, 500 * 5);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < rankCards.length; i++) {
            const img = await Canvas.loadImage(rankCards[i]);
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

async function makeRankCard(userID, usersData, threadsData, threadID, api) {
    const { exp } = await usersData.get(userID);
    const levelUser = expToLevel(exp, deltaNext);
    const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
    const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - exp);

    const allUser = await usersData.getAll();
    allUser.sort((a, b) => b.exp - a.exp);
    const rank = allUser.findIndex(user => user.userID == userID) + 1;

    const customRankCard = await threadsData.get(threadID, "data.customRankCard") || {};
    const dataLevel = {
        exp: currentExp,
        expNextLevel,
        name: allUser[rank - 1].name,
        rank: `#${rank}/${allUser.length}`,
        level: levelUser,
        avatar: await usersData.getAvatarUrl(userID)
    };

    const configRankCard = {
        widthCard: 2000,
        heightCard: 500,
        main_color: "#474747",
        sub_color: "rgba(255, 255, 255, 0.5)",
        alpha_subcard: 0.9,
        exp_color: "#e1e1e1",
        expNextLevel_color: "#3f3f3f",
        text_color: "#000000",
        border_color: rank === 1 ? "#FFD700" : "#00FF00",
        glowing: rank === 1,
        ...customRankCard
    };

    return await drawRankCard(configRankCard, dataLevel);
}

async function drawRankCard(config, data) {
    const {
        widthCard,
        heightCard,
        main_color,
        sub_color,
        alpha_subcard,
        exp_color,
        expNextLevel_color,
        text_color,
        border_color,
        glowing
    } = config;

    const {
        exp,
        expNextLevel,
        name,
        rank,
        level,
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

  
    ctx.fillStyle = text_color;
    ctx.font = '40px "BeVietnamPro-SemiBold"';
    ctx.fillText(`Level: ${level}`, 300, 350);

   
    const expBarWidth = 1000;
    const expBarHeight = 40;
    const expBarX = 300;
    const expBarY = 400;

    ctx.fillStyle = expNextLevel_color;
    ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);

    ctx.fillStyle = exp_color;
    ctx.fillRect(expBarX, expBarY, (exp / expNextLevel) * expBarWidth, expBarHeight);

    ctx.fillStyle = text_color;
    ctx.font = '30px "BeVietnamPro-SemiBold"';
    ctx.fillText(`${exp} / ${expNextLevel} EXP`, expBarX + expBarWidth / 2 - 100, expBarY + expBarHeight / 2 + 10);

    
    ctx.strokeStyle = text_color;
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.lineTo(widthCard - 100, 300);
    ctx.stroke();

    return canvas.toBuffer();
}