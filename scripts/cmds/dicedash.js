const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const cacheDirectory = path.join(__dirname, 'cache');

let lastActivityTime = Date.now();
let activeGames = {}; 

module.exports = {
  config: {
    name: "dicedash",
    aliases: [],
    version: "1.0",
    author: "Kshitiz",
    role: 0,
    shortDescription: "Play roll board dice dash game",
    longDescription: "Dice Dash is a game inspired by Snake and Ladder. Compete with a friend to reach box number 100. Beware of snakes and take advantage of ladders!",
    category: "game",
    guide: {
      en: "{p}dicedash @mention"
    }
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length !== 1) {
      return message.reply("Please mention a user to start the game.");
    }

    const mentionedUserID = mention[0];
    const threadID = event.threadID;

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');

    drawInitialBoard(ctx);

    const imageBuffer = canvas.toBuffer();
    const imagePath = path.join(cacheDirectory, 'game_board.png');
    await fs.promises.mkdir(cacheDirectory, { recursive: true });
    await fs.promises.writeFile(imagePath, imageBuffer);

    const imageStream = fs.createReadStream(imagePath);
    api.sendMessage({ attachment: imageStream }, threadID, () => {});

    const players = [event.senderID, mentionedUserID];
    const firstPlayer = players[Math.floor(Math.random() * 2)]; 
    const secondPlayer = players.find(player => player !== firstPlayer);

    const firstPlayerName = await usersData.getName(firstPlayer);
    const secondPlayerName = await usersData.getName(secondPlayer);

    const mentionMessage = `${firstPlayerName}, you got the red.. ${secondPlayerName}, you got the blue. It's ${firstPlayerName}'s turn. Type \`roll\` to roll the dice.`;
    await message.reply(mentionMessage);

    const gameState = {
      players,
      currentPlayer: firstPlayer,
      firstPlayer,
      secondPlayer,
      firstPlayerPosition: 1, 
      secondPlayerPosition: 1,
      messageId: message.messageID,
      threadID
    };

    activeGames[threadID] = gameState;

    lastActivityTime = Date.now();
  },

  onChat: async function ({ event, message, usersData, api, args }) {
    const threadID = event.threadID;
    const gameState = activeGames[threadID];

    if (!gameState || gameState.messageId !== message.messageID) return;

    const { currentPlayer, firstPlayer, secondPlayer, firstPlayerPosition, secondPlayerPosition, messageId } = gameState;

    const userReply = event.body.trim().toLowerCase();
    if (userReply !== 'roll') return;

    if (event.senderID !== currentPlayer) return;

    const firstDiceRoll = rollDice();
    const secondDiceRoll = rollDice();

    const currentPlayerPosition = currentPlayer === firstPlayer ? firstPlayerPosition : secondPlayerPosition;
    const newPosition = currentPlayerPosition + firstDiceRoll + secondDiceRoll;

    const isSnakeOrLadder = checkSnakeOrLadder(newPosition);

    if (currentPlayer === firstPlayer) {
      gameState.firstPlayerPosition = isSnakeOrLadder || newPosition;
    } else {
      gameState.secondPlayerPosition = isSnakeOrLadder || newPosition;
    }

    const isFirstPlayerWinner = gameState.firstPlayerPosition >= 100;
    const isSecondPlayerWinner = gameState.secondPlayerPosition >= 100;

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');
    drawUpdatedBoard(ctx, gameState);

    const imageBuffer = canvas.toBuffer();
    const imagePath = path.join(cacheDirectory, 'game_board.png');
    await fs.promises.writeFile(imagePath, imageBuffer);

    const imageStream = fs.createReadStream(imagePath);
    api.sendMessage({ attachment: imageStream }, threadID, () => {});

    if (isFirstPlayerWinner || isSecondPlayerWinner) {
      let winner;
      if (isFirstPlayerWinner) {
        winner = await usersData.getName(firstPlayer);
      } else {
        winner = await usersData.getName(secondPlayer);
      }
      await api.sendMessage(`Game over! ${winner} wins!`, threadID);
      delete activeGames[threadID];
      api.unsendMessage(messageId); 
      return;
    }

    const nextPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
    const nextPlayerName = await usersData.getName(nextPlayer);
    const mentionMessage = `${nextPlayerName}, it's your turn. Reply with \`<roll>\` to roll the dice.`;
    await message.reply(mentionMessage);

    gameState.currentPlayer = nextPlayer;

    lastActivityTime = Date.now();
  }
};

function drawInitialBoard(ctx) {
  ctx.fillStyle = 'white'; 
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.fillRect(0, 0, 600, 600);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  for (let i = 9; i >= 0; i--) { 
    for (let j = 0; j < 10; j++) {
      const x = j * 60; 
      const y = i * 60;
      ctx.strokeRect(x, y, 60, 60);
    }
  }

  ctx.font = '20px Arial';
  ctx.fillStyle = '#000000';
  let number = 1;
  for (let i = 9; i >= 0; i--) { 
    for (let j = 0; j < 10; j++) {
      const x = j * 60 + 10; 
      const y = i * 60 + 30;
      ctx.fillText(number.toString(), x, y);
      number++;
    }
  }


  drawSnake(ctx, 47, 28);
  drawLadder(ctx, 25, 46);
  drawLadder(ctx, 38, 62);
  drawSnake(ctx, 67, 54);
  drawSnake(ctx, 73, 16);
  drawSnake(ctx, 82, 51);
  drawLadder(ctx, 36, 93);
  drawLadder(ctx, 49, 88);
  drawSnake(ctx, 64, 60);
  drawSnake(ctx, 98, 85); 
}

function drawUpdatedBoard(ctx, gameState) {
  ctx.fillStyle = 'white'; 
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'; 
  ctx.shadowBlur = 10;
  ctx.fillRect(0, 0, 600, 600);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  for (let i = 9; i >= 0; i--) {
    for (let j = 0; j < 10; j++) {
      const x = j * 60; 
      const y = i * 60;
      ctx.strokeRect(x, y, 60, 60);
    }
  }

  ctx.font = '20px Arial';
  ctx.fillStyle = '#000000';
  let number = 1;
  for (let i = 9; i >= 0; i--) {
    for (let j = 0; j < 10; j++) {
      const x = j * 60 + 10; 
      const y = i * 60 + 30; 
      ctx.fillText(number.toString(), x, y);
      number++;
    }
  }

  drawCircle(ctx, gameState.firstPlayerPosition, 'red');
  drawCircle(ctx, gameState.secondPlayerPosition, 'blue');

 
  drawSnake(ctx, 47, 28);
  drawLadder(ctx, 25, 46);
  drawLadder(ctx, 38, 62);
  drawSnake(ctx, 67, 54);
  drawSnake(ctx, 73, 16);
  drawSnake(ctx, 82, 51);
  drawLadder(ctx, 36, 93);
  drawLadder(ctx, 49, 88);
  drawSnake(ctx, 64, 60);
  drawSnake(ctx, 98, 85);
}

function drawCircle(ctx, position, color) {
  position = position - 1; 
  const row = Math.floor(position / 10);
  const col = position % 10;
  const x = col * 60 + 30; 
  const y = (9 - row) * 60 + 30;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSnake(ctx, start, end) {
  ctx.strokeStyle = 'red'; 
  const startX = ((start - 1) % 10) * 60 + 30;
  const startY = (9 - Math.floor((start - 1) / 10)) * 60 + 30;
  const endX = ((end - 1) % 10) * 60 + 30;
  const endY = (9 - Math.floor((end - 1) / 10)) * 60 + 30;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawLadder(ctx, start, end) {
  ctx.strokeStyle = 'green'; 
  const startX = ((start - 1) % 10) * 60 + 30;
  const startY = (9 - Math.floor((start - 1) / 10)) * 60 + 30;
  const endX = ((end - 1) % 10) * 60 + 30;
  const endY = (9 - Math.floor((end - 1) / 10)) * 60 + 30;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 5;
  ctx.stroke();
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function checkSnakeOrLadder(position) {
  switch (position) {
    case 15:
      return 3;
    case 47:
      return 28;
    case 25:
      return 46;
    case 38:
      return 62;
    case 67:
      return 54;
    case 73:
      return 16;
    case 82:
      return 51;
    case 36:
      return 93;
    case 49:
      return 88;
    case 64:
      return 60;
    case 98:
      return 85;
    default:
      return position;
  }
}
