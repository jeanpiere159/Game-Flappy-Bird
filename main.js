const boardWidth = 500;
const boardHeight = 640;
let gravity = 0.65;
const jumpStrength = -8.5;
let pipeWidth = 80; 
let pipeGap = 180; 
let velocityX = -3;
let difficultyIncrease = 0.002;

let canvas, ctx;
let bird, pipes, score, velocityY, gameState;
const GAME_STATE = { MENU: "menu", PLAYING: "playing", GAME_OVER: "gameOver" };

const images = {
  background: loadImage("./images/flappybirdbg.png"),
  bird: loadImage("./images/flappybird.png"),
  pipeTop: loadImage("./images/toppipe.png"),
  pipeBottom: loadImage("./images/bottompipe.png"),
  playButton: loadImage("./images/flappyBirdPlayButton.png"),
  gameOver: loadImage("./images/flappy-gameover.png"),
  logo: loadImage("./images/flappyBirdLogo.png"),
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function init() {
  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");
  canvas.width = boardWidth;
  canvas.height = boardHeight;

  resetGame();
  document.addEventListener("keydown", handleKeyDown);
  requestAnimationFrame(update);
}

function resetGame() {
  bird = { x: 80, y: boardHeight / 2, width: 40, height: 30 };
  pipes = [];
  score = 0;
  velocityY = 0;
  gameState = GAME_STATE.MENU;
}

function handleKeyDown(e) {
  if (e.code === "Space") {
    if (gameState === GAME_STATE.MENU) {
      startGame();
    } else if (gameState === GAME_STATE.PLAYING) {
      velocityY = jumpStrength;
    } else if (gameState === GAME_STATE.GAME_OVER) {
      resetGame();
    }
  }
}

function startGame() {
  gameState = GAME_STATE.PLAYING;
  setInterval(() => addPipe(), 1400);
}

function addPipe() {
  const topHeight = Math.random() * (boardHeight - pipeGap - 100) + 50;
  pipes.push({ x: boardWidth, y: 0, width: pipeWidth, height: topHeight, passed: false });
  pipes.push({ x: boardWidth, y: topHeight + pipeGap, width: pipeWidth, height: boardHeight - topHeight - pipeGap, passed: false });
}

function update() {
  ctx.clearRect(0, 0, boardWidth, boardHeight);
  drawBackground();

  if (gameState === GAME_STATE.MENU) {
    drawMenu();
  } else if (gameState === GAME_STATE.PLAYING) {
    updateGame();
  } else if (gameState === GAME_STATE.GAME_OVER) {
    drawGameOver();
  }

  requestAnimationFrame(update);
}

function updateGame() {
  velocityY += gravity;
  bird.y = Math.min(bird.y + velocityY, boardHeight - bird.height);

  if (bird.y < 0) bird.y = 0;

  for (const pipe of pipes) {
    pipe.x += velocityX;
    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      pipe.passed = true;
      score += 0.5;
    }
    if (detectCollision(bird, pipe)) {
      gameState = GAME_STATE.GAME_OVER;
    }
  }

  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
  drawBird();
  drawPipes();
  drawScore();

  velocityX -= difficultyIncrease;
}

function drawBackground() {
  ctx.drawImage(images.background, 0, 0, boardWidth, boardHeight);
}

function drawMenu() {
  ctx.drawImage(images.logo, boardWidth / 2 - 150, 100, 300, 100);
  ctx.drawImage(images.playButton, boardWidth / 2 - 57.5, 300, 115, 64);
}

function drawGameOver() {
  ctx.drawImage(images.gameOver, boardWidth / 2 - 200, 150, 400, 80);
  ctx.fillStyle = "white";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Score: ${Math.floor(score)}`, boardWidth / 2, 250);
}

function drawBird() {
  ctx.save();
  let angle = Math.min(Math.max(velocityY * 3, -30), 45);
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(images.bird, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();
}

function drawPipes() {
  for (const pipe of pipes) {
    const img = pipe.y === 0 ? images.pipeTop : images.pipeBottom;
    ctx.drawImage(img, pipe.x, pipe.y, pipe.width, pipe.height);
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(Math.floor(score), 10, 30);
}

function detectCollision(bird, pipe) {
  return (
    bird.x < pipe.x + pipe.width &&
    bird.x + bird.width > pipe.x &&
    bird.y < pipe.y + pipe.height &&
    bird.y + bird.height > pipe.y
  );
}

window.onload = init;
