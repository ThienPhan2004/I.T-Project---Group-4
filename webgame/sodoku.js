let selectedCell = null;
let mistakes = 3;
let solution = [];
let currentBoard = [];
let currentDifficulty = "easy";

function generateSudoku(difficulty) {
  // Tạo bảng Sudoku hoàn chỉnh
  solution = createSolvedBoard();

  // Tạo bản sao để xóa các số
  currentBoard = solution.map((row) => [...row]);

  // Xóa các số tùy theo độ khó
  const cellsToRemove = {
    easy: 30,
    medium: 40,
    hard: 50,
  }[difficulty];

  let count = 0;
  while (count < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (currentBoard[row][col] !== 0) {
      currentBoard[row][col] = 0;
      count++;
    }
  }
}

function createSolvedBoard() {
  const board = Array(9)
    .fill()
    .map(() => Array(9).fill(0));
  fillBoard(board);
  return board;
}

function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValid(board, row, col, num) {
  // Kiểm tra hàng
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Kiểm tra cột
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Kiểm tra block 3x3
  let startRow = row - (row % 3);
  let startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  // Ngăn menu chuột phải mặc định
  board.addEventListener("contextmenu", (e) => e.preventDefault());

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (currentBoard[i][j] !== 0) {
        cell.textContent = currentBoard[i][j];
        cell.classList.add("fixed");
      }

      // Thêm xử lý chuột trái
      cell.onclick = () => selectCell(cell, i, j);

      // Thêm xử lý chuột phải
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cell);
      });

      // Thêm border cho block 3x3
      if (i === 2 || i === 5) {
        cell.classList.add("row-divider");
      }

      board.appendChild(cell);
    }
  }
}

function selectCell(cell, row, col) {
  if (cell.classList.contains("fixed") || cell.classList.contains("flagged"))
    return;

  if (selectedCell) {
    selectedCell.classList.remove("selected");
  }

  selectedCell = cell;
  cell.classList.add("selected");

  // Focus vào cell để nhận input từ bàn phím
  cell.focus();
}

function selectNumber(num) {
  if (!selectedCell || selectedCell.classList.contains("fixed")) return;

  // Xóa cờ nếu có
  selectedCell.classList.remove("flagged");

  const row = Math.floor(
    [...selectedCell.parentNode.children].indexOf(selectedCell) / 9
  );
  const col = [...selectedCell.parentNode.children].indexOf(selectedCell) % 9;

  if (num === 0) {
    // Xóa số
    selectedCell.textContent = "";
    currentBoard[row][col] = 0;
    selectedCell.classList.remove("error");
    return;
  }

  // Kiểm tra tính hợp lệ
  if (num === solution[row][col]) {
    selectedCell.textContent = num;
    currentBoard[row][col] = num;
    selectedCell.classList.remove("error");

    // Kiểm tra thắng
    if (checkWin()) {
      showGameOver(true);
    }
  } else {
    mistakes--;
    document.getElementById("mistakes").textContent = mistakes;

    // Thêm class error và reset animation
    selectedCell.classList.remove("error");
    void selectedCell.offsetWidth; // Trigger reflow
    selectedCell.classList.add("error");

    // Hiển thị số sai với màu đỏ
    selectedCell.textContent = num;

    if (mistakes === 0) {
      showGameOver(false);
    }
  }
}

function checkWin() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (currentBoard[i][j] !== solution[i][j]) {
        return false;
      }
    }
  }
  return true;
}

function showGameOver(won) {
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over").style.display = "block";
  document.getElementById("game-over-text").textContent = won
    ? "Congratulations! You Won!"
    : "Game Over! You Lost!";
}

function startGame(difficulty) {
  currentDifficulty = difficulty;
  mistakes = 3;
  document.getElementById("mistakes").textContent = mistakes;
  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("game-over").style.display = "none";

  generateSudoku(difficulty);
  renderBoard();
}

function showDifficultyScreen() {
  document.getElementById("difficulty-screen").style.display = "block";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over").style.display = "none";
}

// Thêm event listener cho keyboard input
document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
  // Chỉ xử lý khi đang ở màn hình game
  if (document.getElementById("game-screen").style.display === "none") return;

  const key = event.key;

  // Xử lý các phím số (0-9)
  if (/^[0-9]$/.test(key)) {
    selectNumber(parseInt(key));
  }

  // Xử lý phím Delete hoặc Backspace như nút xóa
  if (key === "Delete" || key === "Backspace") {
    selectNumber(0);
  }

  // Xử lý phím mũi tên để di chuyển giữa các ô
  if (selectedCell) {
    const currentIndex = [...selectedCell.parentNode.children].indexOf(
      selectedCell
    );
    const row = Math.floor(currentIndex / 9);
    const col = currentIndex % 9;

    let newRow = row;
    let newCol = col;

    switch (event.key) {
      case "ArrowUp":
        newRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        newRow = Math.min(8, row + 1);
        break;
      case "ArrowLeft":
        newCol = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        newCol = Math.min(8, col + 1);
        break;
    }

    if (newRow !== row || newCol !== col) {
      const newIndex = newRow * 9 + newCol;
      const newCell = document.getElementById("board").children[newIndex];
      selectCell(newCell, newRow, newCol);
      event.preventDefault(); // Ngăn cuộn trang khi dùng phím mũi tên
    }
  }
}

function resetGame() {
  // Reset số lần sai
  mistakes = 3;
  document.getElementById("mistakes").textContent = mistakes;

  // Reset bảng với độ khó hiện tại
  generateSudoku(currentDifficulty);
  renderBoard();

  // Bỏ chọn ô đang chọn
  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell = null;
  }
}

function backToMenu() {
  // Hiển thị lại màn hình chọn độ khó
  document.getElementById("difficulty-screen").style.display = "block";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over").style.display = "none";

  // Reset trạng thái game
  mistakes = 3;
  document.getElementById("mistakes").textContent = mistakes;

  // Bỏ chọn ô đang chọn
  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell = null;
  }
}

// Thêm hàm toggle cờ
function toggleFlag(cell) {
  // Không cho phép đặt cờ trên ô đã có số
  if (cell.classList.contains("fixed") || cell.textContent !== "") {
    return;
  }

  cell.classList.toggle("flagged");
}
