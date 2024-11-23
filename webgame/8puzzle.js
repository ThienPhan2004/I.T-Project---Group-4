// Trạng thái game
let gameState = {
  board: [],
  initialBoard: [],
  emptyPos: { row: 2, col: 2 },
  initialEmptyPos: { row: 2, col: 2 },
  moves: 0,
  solved: false,
  timer: 0,
  timerInterval: null,
};

// Trạng thái đích (đích cần đạt được)
const GOAL_STATE = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, null],
];

// Khởi tạo game mới
function newGame() {
  clearInterval(gameState.timerInterval);

  // Tạo mảng các số từ 1-8 và null
  let numbers = [1, 2, 3, 4, 5, 6, 7, 8, null];

  // Xáo trộn mảng
  do {
    numbers = shuffleArray(numbers);
    gameState.board = [];
    for (let i = 0; i < 3; i++) {
      gameState.board[i] = numbers.slice(i * 3, (i + 1) * 3);
    }
  } while (!isSolvable(gameState.board) || isComplete(gameState.board));

  // Lưu trạng thái ban đầu
  gameState.initialBoard = gameState.board.map((row) => [...row]);

  // Tìm vị trí ô trống
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (gameState.board[i][j] === null) {
        gameState.emptyPos = { row: i, col: j };
        gameState.initialEmptyPos = { row: i, col: j };
      }
    }
  }

  gameState.moves = 0;
  gameState.solved = false;
  gameState.timer = 0;

  updateMoves();
  updateTimer();
  renderBoard();
  startTimer();
}

// Xáo trộn mảng
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Kiểm tra xem puzzle có thể giải được không
function isSolvable(board) {
  let inversions = 0;
  let flatBoard = board.flat().filter((x) => x !== null);

  for (let i = 0; i < flatBoard.length - 1; i++) {
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[i] > flatBoard[j]) {
        inversions++;
      }
    }
  }

  return inversions % 2 === 0;
}

// Render bảng game
function renderBoard() {
  const board = document.getElementById("puzzle-board");
  board.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = document.createElement("div");
      tile.className =
        "tile" + (gameState.board[i][j] === null ? " empty" : "");
      tile.textContent = gameState.board[i][j] || "";
      tile.onclick = () => handleTileClick(i, j);
      board.appendChild(tile);
    }
  }
}

// Xử lý click vào ô
function handleTileClick(row, col) {
  if (gameState.solved) return;

  if (isMovable(row, col)) {
    gameState.board[gameState.emptyPos.row][gameState.emptyPos.col] =
      gameState.board[row][col];
    gameState.board[row][col] = null;
    gameState.emptyPos = { row, col };
    gameState.moves++;

    updateMoves();
    renderBoard();

    if (isComplete(gameState.board)) {
      clearInterval(gameState.timerInterval);
      showWinMessage();
    }
  }
}

// Kiểm tra xem ô có thể di chuyển không
function isMovable(row, col) {
  return (
    (Math.abs(row - gameState.emptyPos.row) === 1 &&
      col === gameState.emptyPos.col) ||
    (Math.abs(col - gameState.emptyPos.col) === 1 &&
      row === gameState.emptyPos.row)
  );
}

// Kiểm tra xem puzzle đã hoàn thành chưa
function isComplete(board) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] !== GOAL_STATE[i][j]) {
        return false;
      }
    }
  }
  return true;
}

// Cập nhật số bước di chuyển
function updateMoves() {
  document.getElementById("moves").textContent = `Moves: ${gameState.moves}`;
}

// Hiển thị thông báo chiến thắng
function showWinMessage() {
  gameState.solved = true;
  const minutes = Math.floor(gameState.timer / 60);
  const seconds = gameState.timer % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const message = document.getElementById("win-message");
  message.textContent = `Congratulations! You solved the puzzle in ${timeStr} and ${gameState.moves} moves!`;
  message.style.display = "block";
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
}

// Hiển thị giải pháp
function showSolution() {
  // Đây chỉ là demo, hiển thị trạng thái đích
  alert("Solution pattern:\n1 2 3\n4 5 6\n7 8 _");
}

// Hàm reset về trạng thái ban đầu
function resetCurrentGame() {
  gameState.board = gameState.initialBoard.map((row) => [...row]);
  gameState.emptyPos = { ...gameState.initialEmptyPos };
  gameState.moves = 0;
  gameState.solved = false;

  updateMoves();
  renderBoard();

  // Reset timer
  clearInterval(gameState.timerInterval);
  gameState.timer = 0;
  updateTimer();
  startTimer();
}

// Hàm bắt đầu đếm thời gian
function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerInterval = setInterval(() => {
    gameState.timer++;
    updateTimer();
  }, 1000);
}

// Hàm cập nhật hiển thị thời gian
function updateTimer() {
  const minutes = Math.floor(gameState.timer / 60);
  const seconds = gameState.timer % 60;
  document.getElementById("timer").textContent = `Time: ${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Khởi tạo game khi trang web load
document.addEventListener("DOMContentLoaded", newGame);
