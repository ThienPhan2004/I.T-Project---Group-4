const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const CELL_SIZE = 30;
const GRID_SIZE = 20;
const BOARD_SIZE = CELL_SIZE * GRID_SIZE;

// Khởi tạo canvas
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;
document
  .querySelector(".container")
  .insertBefore(canvas, document.getElementById("resetBtn"));

let board = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill(null)
);
let currentPlayer = "X";
let gameOver = false;
let gameMode = null;
const gameInfo = document.getElementById("gameInfo");
const modeSelection = document.getElementById("modeSelection");
const resetBtn = document.getElementById("resetBtn");
const backBtn = document.getElementById("backBtn");

function startGame(mode) {
  gameMode = mode;
  modeSelection.style.display = "none";
  canvas.style.display = "block";
  gameInfo.style.display = "block";
  resetBtn.style.display = "block";
  backBtn.style.display = "block";
  resetGame();
}

function backToMenu() {
  modeSelection.style.display = "block";
  canvas.style.display = "none";
  gameInfo.style.display = "none";
  resetBtn.style.display = "none";
  backBtn.style.display = "none";
  gameMode = null;
}

// Vẽ bàn cờ
function drawBoard() {
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  // Vẽ lưới
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, BOARD_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(BOARD_SIZE, i * CELL_SIZE);
    ctx.stroke();
  }

  // Vẽ X và O
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (board[y][x] === "X") {
        drawX(x, y);
      } else if (board[y][x] === "O") {
        drawO(x, y);
      }
    }
  }
}

function drawX(x, y) {
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 2;
  const padding = 5;
  const xPos = x * CELL_SIZE;
  const yPos = y * CELL_SIZE;

  ctx.beginPath();
  ctx.moveTo(xPos + padding, yPos + padding);
  ctx.lineTo(xPos + CELL_SIZE - padding, yPos + CELL_SIZE - padding);
  ctx.moveTo(xPos + CELL_SIZE - padding, yPos + padding);
  ctx.lineTo(xPos + padding, yPos + CELL_SIZE - padding);
  ctx.stroke();
}

function drawO(x, y) {
  ctx.strokeStyle = "#0000ff";
  ctx.lineWidth = 2;
  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;
  const radius = CELL_SIZE / 2 - 5;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function handleClick(event) {
  if (gameOver) return;
  if (gameMode === "pvc" && currentPlayer === "O") return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

  if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !board[y][x]) {
    makeMove(x, y);
  }
}

function makeMove(x, y) {
  if (board[y][x] === null) {
    board[y][x] = currentPlayer;
    drawBoard();

    if (checkWin(x, y)) {
      gameOver = true;
      gameInfo.textContent = `${currentPlayer} thắng!`;
      return;
    }

    if (checkDraw()) {
      gameOver = true;
      gameInfo.textContent = "Hòa!";
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    gameInfo.textContent = `Lượt của ${currentPlayer}`;

    if (gameMode === "pvc" && currentPlayer === "O") {
      setTimeout(makeAIMove, 500);
    }
  }
}

function makeAIMove() {
  const depth = 3;
  const move = minimax(depth, true, -Infinity, Infinity);

  // Kiểm tra nếu có nước đi nguy hiểm cần chặn ngay
  const emergencyMove = findEmergencyMove();
  if (emergencyMove) {
    makeMove(emergencyMove.x, emergencyMove.y);
  } else {
    makeMove(move.x, move.y);
  }
}

function minimax(depth, isMaximizing, alpha, beta) {
  if (depth === 0) {
    return {
      score: evaluateBoard(),
    };
  }

  const moves = getPossibleMoves();

  if (moves.length === 0) {
    return {
      score: 0,
    };
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      board[move.y][move.x] = "O";
      const score = minimax(depth - 1, false, alpha, beta).score;
      board[move.y][move.x] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }

    return { x: bestMove.x, y: bestMove.y, score: bestScore };
  } else {
    let bestScore = Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      board[move.y][move.x] = "X";
      const score = minimax(depth - 1, true, alpha, beta).score;
      board[move.y][move.x] = null;

      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }

    return { x: bestMove.x, y: bestMove.y, score: bestScore };
  }
}

function getPossibleMoves() {
  const moves = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (board[y][x] === null && hasAdjacentPiece(x, y)) {
        const score = evaluatePosition(x, y);
        moves.push({ x, y, score });
      }
    }
  }

  // Nếu bàn cờ trống, đánh vào giữa
  if (moves.length === 0) {
    const center = Math.floor(GRID_SIZE / 2);
    return [{ x: center, y: center, score: 0 }];
  }

  moves.sort((a, b) => b.score - a.score);
  return moves;
}

function hasAdjacentPiece(x, y) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const newY = y + dy;
      const newX = x + dx;
      if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        if (board[newY][newX] !== null) return true;
      }
    }
  }
  return false;
}

function evaluateBoard() {
  let score = 0;

  // Đánh giá theo hàng, cột và đường chéo
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (board[y][x] !== null) {
        score += evaluatePosition(x, y);
      }
    }
  }

  return score;
}

function evaluatePosition(x, y) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  let score = 0;

  for (const [dx, dy] of directions) {
    const line = getLine(x, y, dx, dy);
    const lineScore = evaluateLine(line);
    score += lineScore;

    // Tăng điểm cho vị trí trung tâm
    const centerDistance =
      Math.abs(x - GRID_SIZE / 2) + Math.abs(y - GRID_SIZE / 2);
    score -= centerDistance * 10;

    // Tăng điểm cho vị trí gần quân đã đánh
    if (hasAdjacentPiece(x, y)) {
      score += 100;
    }
  }

  return score;
}

function getLine(x, y, dx, dy) {
  const line = [];

  for (let i = -4; i <= 4; i++) {
    const newX = x + dx * i;
    const newY = y + dy * i;

    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
      line.push(board[newY][newX]);
    }
  }

  return line;
}

function evaluateLine(line) {
  const scores = {
    OOOOO: 1000000, // Thắng ngay
    XXXX_: -500000, // Chặn ngay nếu đối thủ sắp thắng
    _XXXX: -500000, // Chặn ngay nếu đối thủ sắp thắng
    _XXXX_: -500000, // Chặn ngay nếu đối thủ sắp thắng
    OOOO_: 50000, // Tạo cơ hội thắng
    _OOOO: 50000, // Tạo cơ hội thắng
    _OOOO_: 50000, // Tạo cơ hội thắng
    XXX_X: -20000, // Chặn ngay
    X_XXX: -20000, // Chặn ngay
    XX_XX: -20000, // Chặn ngay
    OOO__: 10000, // Tấn công
    __OOO: 10000, // Tấn công
    _OOO_: 10000, // Tấn công
    XXX__: -8000, // Phòng thủ
    __XXX: -8000, // Phòng thủ
    _XXX_: -8000, // Phòng thủ
    XX___: -500, // Phòng thủ sớm
    ___XX: -500, // Phòng thủ sớm
    _XX__: -500, // Phòng thủ sớm
    OO___: 100, // Tạo cơ hội
    ___OO: 100, // Tạo cơ hội
    _OO__: 100, // Tạo cơ hội
  };

  let score = 0;
  const lineStr = line.map((cell) => (cell === null ? "_" : cell)).join("");

  for (const [pattern, value] of Object.entries(scores)) {
    if (lineStr.includes(pattern)) {
      score += value;
      // Tăng điểm cho các mẫu đối xứng
      if (
        pattern.includes("X") &&
        lineStr.includes(pattern.split("").reverse().join(""))
      ) {
        score += value * 0.5;
      }
    }
  }

  return score;
}

function checkWin(x, y) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  const player = board[y][x];

  for (const [dx, dy] of directions) {
    let count = 1;

    // Kiểm tra một hướng
    for (let i = 1; i < 5; i++) {
      const newX = x + dx * i;
      const newY = y + dy * i;
      if (
        newX >= 0 &&
        newX < GRID_SIZE &&
        newY >= 0 &&
        newY < GRID_SIZE &&
        board[newY][newX] === player
      ) {
        count++;
      } else break;
    }

    // Kiểm tra hướng ngược lại
    for (let i = 1; i < 5; i++) {
      const newX = x - dx * i;
      const newY = y - dy * i;
      if (
        newX >= 0 &&
        newX < GRID_SIZE &&
        newY >= 0 &&
        newY < GRID_SIZE &&
        board[newY][newX] === player
      ) {
        count++;
      } else break;
    }

    if (count >= 5) return true;
  }
  return false;
}

function checkDraw() {
  return board.every((row) => row.every((cell) => cell !== null));
}

function resetGame() {
  board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  currentPlayer = "X";
  gameOver = false;
  gameInfo.textContent = "Lượt của X";
  drawBoard();
}

function findEmergencyMove() {
  // Kiểm tra các trường hợp cần chặn ngay
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (board[y][x] === null) {
        // Giả lập nước đi của người chơi
        board[y][x] = "X";
        if (checkWin(x, y)) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;

        // Kiểm tra nếu máy có thể thắng ngay
        board[y][x] = "O";
        if (checkWin(x, y)) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;
      }
    }
  }
  return null;
}

// Khởi tạo game
canvas.addEventListener("click", handleClick);
drawBoard();
