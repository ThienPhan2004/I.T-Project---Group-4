// Danh sách từ khóa
const WORDS = [
  "apple",
  "astronaut",
  "bicycle",
  "butterfly",
  "castle",
  "chemistry",
  "concert",
  "democracy",
  "dinosaur",
  "electricity",
  "elephant",
  "galaxy",
  "guitar",
  "hurricane",
  "iceberg",
  "kangaroo",
  "library",
  "lightning",
  "magnolia",
  "microscope",
  "museum",
  "navy",
  "orchestra",
  "oxygen",
  "painting",
  "parliament",
  "photography",
  "planet",
  "poetry",
  "pyramid",
  "quasar",
  "rainforest",
  "rocket",
  "sculpture",
  "skyscraper",
  "sociology",
  "submarine",
  "symphony",
  "telescope",
  "theater",
  "tiger",
  "university",
  "volcano",
  "waterfall",
  "wilderness",
  "xylophone",
  "yogurt",
  "zebra",
];

const GRID_SIZE = 12;
const WORDS_PER_GAME = 3;

let gameState = {
  grid: [],
  words: [],
  foundWords: new Set(),
  selectedCells: [],
  timer: 0,
  timerInterval: null,
};

// Khởi tạo game mới
function newGame() {
  clearInterval(gameState.timerInterval);
  gameState = {
    grid: Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill("")),
    words: selectRandomWords(WORDS_PER_GAME),
    foundWords: new Set(),
    selectedCells: [],
    timer: 0,
    timerInterval: null,
  };

  initializeGrid();
  startTimer();
  console.log("Selected words:", gameState.words);
}

// Chọn từ ngẫu nhiên
function selectRandomWords(count) {
  let shuffled = [...WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Khởi tạo lưới
function initializeGrid() {
  // Đặt các từ vào lưới
  gameState.words.forEach((word) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const direction = Math.floor(Math.random() * 3); // 0: ngang, 1: dọc, 2: chéo
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);

      if (canPlaceWord(word, x, y, direction)) {
        placeWord(word, x, y, direction);
        placed = true;
      }
      attempts++;
    }
  });

  // Điền các ô trống bằng chữ cái ngẫu nhiên
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (gameState.grid[i][j] === "") {
        gameState.grid[i][j] = String.fromCharCode(
          65 + Math.floor(Math.random() * 26)
        );
      }
    }
  }

  renderGrid();
  renderWordList();
}

// Kiểm tra có thể đặt từ không
function canPlaceWord(word, x, y, direction) {
  const dx = [1, 0, 1][direction];
  const dy = [0, 1, 1][direction];

  if (
    x + dx * (word.length - 1) >= GRID_SIZE ||
    y + dy * (word.length - 1) >= GRID_SIZE
  )
    return false;

  for (let i = 0; i < word.length; i++) {
    const currentX = x + dx * i;
    const currentY = y + dy * i;
    if (
      gameState.grid[currentX][currentY] !== "" &&
      gameState.grid[currentX][currentY] !== word[i].toUpperCase()
    ) {
      return false;
    }
  }
  return true;
}

// Đặt từ vào lưới
function placeWord(word, x, y, direction) {
  const dx = [1, 0, 1][direction];
  const dy = [0, 1, 1][direction];

  for (let i = 0; i < word.length; i++) {
    const currentX = x + dx * i;
    const currentY = y + dy * i;
    gameState.grid[currentX][currentY] = word[i].toUpperCase();
  }
}

// Render lưới
function renderGrid() {
  const grid = document.getElementById("grid");
  grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;
  grid.innerHTML = "";

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = gameState.grid[i][j];
      cell.dataset.x = i;
      cell.dataset.y = j;

      cell.addEventListener("mousedown", startSelection);
      cell.addEventListener("mouseover", continueSelection);
      cell.addEventListener("mouseup", endSelection);

      grid.appendChild(cell);
    }
  }
}

// Render danh sách từ
function renderWordList() {
  const wordList = document.getElementById("word-list");
  wordList.innerHTML = "";

  gameState.words.forEach((word) => {
    const wordElement = document.createElement("div");
    wordElement.className = `word ${
      gameState.foundWords.has(word) ? "found" : ""
    }`;
    wordElement.textContent = word.toUpperCase();
    wordList.appendChild(wordElement);
  });
}

// Xử lý sự kiện chọn
function startSelection(e) {
  gameState.selectedCells = [e.target];
  e.target.classList.add("selected");
}

function continueSelection(e) {
  if (gameState.selectedCells.length === 0) return;
  if (!e.target.classList.contains("cell")) return;
  if (gameState.selectedCells.includes(e.target)) return;

  gameState.selectedCells.push(e.target);
  e.target.classList.add("selected");
}

function endSelection() {
  const word = gameState.selectedCells
    .map((cell) => cell.textContent)
    .join("")
    .toLowerCase();

  if (gameState.words.includes(word) && !gameState.foundWords.has(word)) {
    gameState.foundWords.add(word);
    gameState.selectedCells.forEach((cell) => cell.classList.add("found"));
    renderWordList();
    checkWinCondition();
  }

  gameState.selectedCells.forEach((cell) => cell.classList.remove("selected"));
  gameState.selectedCells = [];
}

// Kiểm tra thắng
function checkWinCondition() {
  if (gameState.foundWords.size === WORDS_PER_GAME) {
    clearInterval(gameState.timerInterval);
    const message = `
          Congratulations! 
          You found all ${WORDS_PER_GAME} words in ${formatTime(
      gameState.timer
    )}!
          Play again?
      `;
    setTimeout(() => {
      if (confirm(message)) {
        newGame();
      }
    }, 300);
  }
}

// Timer
function startTimer() {
  gameState.timerInterval = setInterval(() => {
    gameState.timer++;
    document.getElementById("stats").textContent = `Time: ${formatTime(
      gameState.timer
    )}`;
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Hint
function showHint() {
  const remainingWords = gameState.words.filter(
    (word) => !gameState.foundWords.has(word)
  );
  if (remainingWords.length > 0) {
    const randomWord =
      remainingWords[Math.floor(Math.random() * remainingWords.length)];
    alert(`Try to find: ${randomWord.toUpperCase()}`);
  }
}

// Khởi tạo game khi trang load
document.addEventListener("DOMContentLoaded", newGame);
