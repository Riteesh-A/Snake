const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const submitUrl = new URL("http://127.0.0.1:3000/submit-score");
const leaderboardUrl = new URL("http://localhost:3000/leaderboard");

let snake = [{ x: 200, y: 200 }];
let food = { x: 300, y: 300 };
let dx = 10;
let dy = 0;
let gameOver = false;

let playAgain = true;

function clearCanvas(){
  ctx.fillStyle = "white"
  ctx.fillRect(0,0, canvas.width, canvas.height);
}

setInterval(() => {
  if (playAgain) requestAnimationFrame(gameLoop);
}, 125);

function gameLoop() {
  if (gameOver) {
    const playerName = prompt("Game Over! Enter your name:");
    const score = snake.length;
    submitScore(playerName, score);
    playAgain = confirm("Play Again?");
    if (playAgain) {
      snake = [{ x: 200, y: 200 }];
      food = { x: 300, y: 300 };
      dx = 10;
      dy = 0;
      gameOver = false;
      clearCanvas()
    } else return;
  }

  drawFood();
  const tail = moveSnake();
  drawSnake(tail);
  checkCollision();
}

function drawSnake(tail) {
  ctx.fillStyle = "green";
  ctx.fillRect(snake[0].x, snake[0].y, 10, 10);
  if (tail) {
    ctx.fillStyle = "white";
    ctx.fillRect(tail.x, tail.y, 10, 10);
  }
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) placeFood();
  else return snake.pop();
  return false;
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 10, 10);
}

function placeFood() {
  food.x = Math.floor(Math.random() * (canvas.width / 10)) * 10;
  food.y = Math.floor(Math.random() * (canvas.height / 10)) * 10;
}

function checkCollision() {
  const head = snake[0];
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snakeIntersection()
  ) {
    gameOver = true;
  }
}

function snakeIntersection() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  return false;
}

function submitScore(playerName, score) {
  fetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerName, score }),
  }).then(() => updateLeaderboard());
}

async function updateLeaderboard() {
  const response = await fetch(leaderboardUrl);
  const scores = await response.json();
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";
  scores.forEach((score) => {
    const li = document.createElement("li");
    li.textContent = `${score.playerName}: ${score.score}`;
    leaderboardList.appendChild(li);
  });
}

async function createLeaderboardEntry(playerName, score) {
  const entry = new Leaderboard({ playerName, score });
  await entry.save();
  console.log('Leaderboard entry created:', entry);
}

async function getTopScores(limit = 10) {
  const topScores = await Leaderboard.find().sort({ score: -1 }).limit(limit);
  console.log('Top scores:', topScores);
  return topScores;
}

async function updateLeaderboardEntry(playerName, newScore) {
  const updatedEntry = await Leaderboard.findOneAndUpdate(
    { playerName },
    { score: newScore },
    { new: true }
  );
  console.log('Leaderboard entry updated:', updatedEntry);
}

async function deleteLeaderboardEntry(playerName) {
  const result = await Leaderboard.deleteOne({ playerName });
  console.log('Leaderboard entry deleted:', result);
}



document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  const keyPressed = event.keyCode;
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;

  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -10;
    dy = 0;
  }

  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;
  }

  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;
  }

  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;
  }
}

requestAnimationFrame(gameLoop);
document.addEventListener("DOMContentLoaded", updateLeaderboard);
