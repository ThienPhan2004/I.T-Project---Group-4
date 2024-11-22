const GAME_CONFIG = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

let gameState = {
  grid: [],
  mineLocations: [],
  revealed: 0,
  gameOver: false,
  flagsPlaced: 0,
  timer: 0,
  timerInterval: null,
  difficulty: null,
};

function startGame(difficulty) {
  gameState.difficulty = difficulty;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  initializeGame(GAME_CONFIG[difficulty]);
  startTimer();
}

function backToMenu() {
  document.getElementById("menu").style.display = "block";
  document.getElementById("game-container").style.display = "none";
  stopTimer();
}

function initializeGame(config) {
  gameState = {
    grid: [],
    mineLocations: [],
    revealed: 0,
    gameOver: false,
    flagsPlaced: 0,
    timer: 0,
    timerInterval: null,
    difficulty: gameState.difficulty,
  };

  // Khởi tạo lưới
  for (let i = 0; i < config.rows; i++) {
    gameState.grid[i] = [];
    for (let j = 0; j < config.cols; j++) {
      gameState.grid[i][j] = {
        isMine: false,
        neighborMines: 0,
        isRevealed: false,
        isFlagged: false,
      };
    }
  }

  // Đặt bom
  placeMines(config);

  // Tính số bom xung quanh cho mỗi ô
  calculateNeighborMines(config);

  // Vẽ lưới
  createGrid(config);

  // Cập nhật số bom còn lại
  updateMinesLeft();
}

function placeMines(config) {
  let minesPlaced = 0;
  while (minesPlaced < config.mines) {
    const row = Math.floor(Math.random() * config.rows);
    const col = Math.floor(Math.random() * config.cols);

    if (!gameState.grid[row][col].isMine) {
      gameState.grid[row][col].isMine = true;
      gameState.mineLocations.push({ row, col });
      minesPlaced++;
    }
  }
}

function calculateNeighborMines(config) {
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (!gameState.grid[row][col].isMine) {
        let count = 0;
        // Kiểm tra 8 ô xung quanh
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const newRow = row + i;
            const newCol = col + j;

            if (
              newRow >= 0 &&
              newRow < config.rows &&
              newCol >= 0 &&
              newCol < config.cols &&
              gameState.grid[newRow][newCol].isMine
            ) {
              count++;
            }
          }
        }
        gameState.grid[row][col].neighborMines = count;
      }
    }
  }
}

function createGrid(config) {
  const gridElement = document.getElementById("grid");
  gridElement.innerHTML = "";
  gridElement.style.width = `${config.cols * 34}px`; // 30px cell + 2px margin + 2px border

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener("click", () => handleCellClick(row, col));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleRightClick(row, col);
      });

      gridElement.appendChild(cell);
    }
  }
}

function handleCellClick(row, col) {
  if (gameState.gameOver || gameState.grid[row][col].isFlagged) return;

  const cell = gameState.grid[row][col];

  if (cell.isMine) {
    gameOver(false);
    return;
  }

  revealCell(row, col);

  if (checkWin()) {
    gameOver(true);
  }
}

function handleRightClick(row, col) {
  if (gameState.gameOver || gameState.grid[row][col].isRevealed) return;

  const cell = gameState.grid[row][col];
  cell.isFlagged = !cell.isFlagged;

  const cellElement = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`
  );
  cellElement.innerHTML = cell.isFlagged ? "🚩" : "";

  gameState.flagsPlaced += cell.isFlagged ? 1 : -1;
  updateMinesLeft();
}

function revealCell(row, col) {
  const cell = gameState.grid[row][col];
  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;
  gameState.revealed++;

  const cellElement = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`
  );
  cellElement.classList.add("revealed");

  if (cell.neighborMines > 0) {
    cellElement.textContent = cell.neighborMines;
    cellElement.style.color = getNumberColor(cell.neighborMines);
  } else {
    // Nếu ô trống, mở các ô xung quanh
    const config = GAME_CONFIG[gameState.difficulty];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const newRow = row + i;
        const newCol = col + j;

        if (
          newRow >= 0 &&
          newRow < config.rows &&
          newCol >= 0 &&
          newCol < config.cols
        ) {
          revealCell(newRow, newCol);
        }
      }
    }
  }
}

function getNumberColor(number) {
  const colors = [
    "#0000FF", // 1: Blue
    "#008000", // 2: Green
    "#FF0000", // 3: Red
    "#000080", // 4: Navy
    "#800000", // 5: Maroon
    "#008080", // 6: Teal
    "#000000", // 7: Black
    "#808080", // 8: Gray
  ];
  return colors[number - 1] || "black";
}

function gameOver(won) {
  gameState.gameOver = true;
  stopTimer();

  // Hiện tất cả bom
  gameState.mineLocations.forEach(({ row, col }) => {
    const cellElement = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    cellElement.innerHTML = "💣";
    if (!won) cellElement.classList.add("mine");
  });

  setTimeout(() => {
    alert(won ? "Chúc mừng! Bạn đã thắng!" : "Game Over! Bạn đã thua!");
  }, 100);
}

function checkWin() {
  const config = GAME_CONFIG[gameState.difficulty];
  const totalCells = config.rows * config.cols;
  return gameState.revealed === totalCells - config.mines;
}

function updateMinesLeft() {
  const config = GAME_CONFIG[gameState.difficulty];
  document.getElementById("mines-left").textContent =
    config.mines - gameState.flagsPlaced;
}

function startTimer() {
  stopTimer();
  gameState.timer = 0;
  document.getElementById("timer").textContent = "0";
  gameState.timerInterval = setInterval(() => {
    gameState.timer++;
    document.getElementById("timer").textContent = gameState.timer;
  }, 1000);
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}
