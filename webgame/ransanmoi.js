const GRID_SIZE = 20; // Kích thước của mỗi ô
const GRID_WIDTH = 600 / GRID_SIZE; // Số ô theo chiều ngang
const GRID_HEIGHT = 400 / GRID_SIZE; // Số ô theo chiều dọc

const DIRECTIONS = {
  37: { x: -1, y: 0 }, // Left
  38: { x: 0, y: -1 }, // Up
  39: { x: 1, y: 0 }, // Right
  40: { x: 0, y: 1 }, // Down
};

// Thêm các hằng số cho tốc độ
const SPEED_LEVELS = [
  { score: 0, interval: 150 }, // Tốc độ ban đầu
  { score: 100, interval: 130 }, // Tăng tốc ở 100 điểm
  { score: 200, interval: 110 }, // Tăng tốc ở 200 điểm
  { score: 300, interval: 90 }, // Tăng tốc ở 300 điểm
  { score: 500, interval: 70 }, // Tốc độ tối đa ở 500 điểm
];

let gameState = {
  snake: [],
  direction: { x: 1, y: 0 },
  food: null,
  bigFood: null,
  foodCount: 0,
  obstacles: [],
  score: 0,
  level: 1,
  gameLoop: null,
  isPaused: false,
  currentSpeed: SPEED_LEVELS[0].interval, // Thêm thuộc tính tốc độ
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Khởi tạo game với level được chọn
function startLevel(level) {
  gameState.level = level;
  document.getElementById("menu-screen").classList.remove("active");
  document.getElementById("game-screen").classList.add("active");
  initGame();
}

// Khởi tạo game
function initGame() {
  // Khởi tạo rắn
  gameState.snake = [
    { x: 5, y: Math.floor(GRID_HEIGHT / 2) },
    { x: 4, y: Math.floor(GRID_HEIGHT / 2) },
    { x: 3, y: Math.floor(GRID_HEIGHT / 2) },
  ];

  gameState.direction = { x: 1, y: 0 };
  gameState.score = 0;
  gameState.foodCount = 0;
  gameState.food = null;
  gameState.bigFood = null;
  gameState.obstacles = [];

  // Tạo chướng ngại vật cho level 2 và 3
  if (gameState.level >= 2) {
    createObstacles();
  }

  // Tạo tường cho level 3
  if (gameState.level === 3) {
    createWalls();
  }

  spawnFood();
  updateScore();

  gameState.currentSpeed = SPEED_LEVELS[0].interval;

  if (gameState.gameLoop) {
    clearInterval(gameState.gameLoop);
  }

  gameState.gameLoop = setInterval(gameLoop, gameState.currentSpeed);
  document.addEventListener("keydown", handleKeyPress);
}

// Tạo chướng ngại vật
function createObstacles() {
  const obstacleCount = gameState.level === 2 ? 5 : 8;
  for (let i = 0; i < obstacleCount; i++) {
    let obstacle;
    do {
      obstacle = {
        x: Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2,
        y: Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2,
      };
    } while (isPositionOccupied(obstacle));
    gameState.obstacles.push(obstacle);
  }
}

// Tạo tường bao quanh
function createWalls() {
  // Tường ngang
  for (let x = 0; x < GRID_WIDTH; x++) {
    gameState.obstacles.push({ x: x, y: 0 });
    gameState.obstacles.push({ x: x, y: GRID_HEIGHT - 1 });
  }
  // Tường dọc
  for (let y = 0; y < GRID_HEIGHT; y++) {
    gameState.obstacles.push({ x: 0, y: y });
    gameState.obstacles.push({ x: GRID_WIDTH - 1, y: y });
  }
}

// Kiểm tra vị trí có bị chiếm không
function isPositionOccupied(pos) {
  // Kiểm tra rắn
  if (
    gameState.snake.some(
      (segment) => segment.x === pos.x && segment.y === pos.y
    )
  ) {
    return true;
  }

  // Kiểm tra thức ăn
  if (
    gameState.food &&
    gameState.food.x === pos.x &&
    gameState.food.y === pos.y
  ) {
    return true;
  }

  // Kiểm tra chướng ngại vật
  if (gameState.obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y)) {
    return true;
  }

  return false;
}
// Tạo thức ăn mới
function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  } while (isPositionOccupied(newFood));

  gameState.food = newFood;

  // Tạo thức ăn lớn sau khi ăn 4 thức ăn nhỏ
  if (
    gameState.foodCount > 0 &&
    gameState.foodCount % 4 === 0 &&
    !gameState.bigFood
  ) {
    let bigFood;
    do {
      bigFood = {
        x: Math.floor(Math.random() * (GRID_WIDTH - 1)), // Trừ 1 để đảm bảo có chỗ cho ô 2x2
        y: Math.floor(Math.random() * (GRID_HEIGHT - 1)),
      };
    } while (
      isPositionOccupied(bigFood) ||
      isPositionOccupied({ x: bigFood.x + 1, y: bigFood.y }) ||
      isPositionOccupied({ x: bigFood.x, y: bigFood.y + 1 }) ||
      isPositionOccupied({ x: bigFood.x + 1, y: bigFood.y + 1 })
    );
    gameState.bigFood = bigFood;
  }
}

// Game loop chính
function gameLoop() {
  if (gameState.isPaused) return;

  const head = {
    x: gameState.snake[0].x + gameState.direction.x,
    y: gameState.snake[0].y + gameState.direction.y,
  };

  // Xử lý teleport cho màn 1 và 2
  if (gameState.level === 1 || gameState.level === 2) {
    // Nếu đi qua biên phải -> xuất hiện ở biên trái
    if (head.x >= GRID_WIDTH) {
      head.x = 0;
    }
    // Nếu đi qua biên trái -> xuất hiện ở biên phải
    else if (head.x < 0) {
      head.x = GRID_WIDTH - 1;
    }
    // Nếu đi qua biên dưới -> xuất hiện ở biên trên
    if (head.y >= GRID_HEIGHT) {
      head.y = 0;
    }
    // Nếu đi qua biên trên -> xuất hiện ở biên dưới
    else if (head.y < 0) {
      head.y = GRID_HEIGHT - 1;
    }
  }

  // Kiểm tra va chạm (chỉ sau khi đã xử lý teleport)
  if (isCollision(head)) {
    gameOver();
    return;
  }

  gameState.snake.unshift(head);

  let ate = false;
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.score += 10;
    gameState.foodCount++;
    spawnFood();
    ate = true;
  }

  // Kiểm tra ăn thức ăn lớn
  if (
    gameState.bigFood &&
    ((head.x === gameState.bigFood.x && head.y === gameState.bigFood.y) ||
      (head.x === gameState.bigFood.x + 1 && head.y === gameState.bigFood.y) ||
      (head.x === gameState.bigFood.x && head.y === gameState.bigFood.y + 1) ||
      (head.x === gameState.bigFood.x + 1 &&
        head.y === gameState.bigFood.y + 1))
  ) {
    gameState.score += 40;
    gameState.bigFood = null;
    ate = true;
  }

  if (!ate) {
    gameState.snake.pop();
  }

  updateScore();
  draw();
}

// Kiểm tra va chạm
function isCollision(pos) {
  // Va chạm với tường chỉ áp dụng cho level 3
  // Các level khác không cần kiểm tra va chạm với tường vì đã có teleport

  // Va chạm với thân rắn
  if (
    gameState.snake.some(
      (segment) => segment.x === pos.x && segment.y === pos.y
    )
  ) {
    return true;
  }

  // Va chạm với chướng ngại vật
  if (gameState.obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y)) {
    return true;
  }

  return false;
}

// Vẽ game
function draw() {
  // Xóa canvas
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ thân rắn
  ctx.fillStyle = "#4CAF50";
  for (let i = 1; i < gameState.snake.length; i++) {
    ctx.fillRect(
      gameState.snake[i].x * GRID_SIZE,
      gameState.snake[i].y * GRID_SIZE,
      GRID_SIZE - 1,
      GRID_SIZE - 1
    );
  }

  // Vẽ đầu rắn với màu khác
  ctx.fillStyle = "#2E7D32"; // Màu xanh đậm hơn cho đầu rắn
  ctx.fillRect(
    gameState.snake[0].x * GRID_SIZE,
    gameState.snake[0].y * GRID_SIZE,
    GRID_SIZE - 1,
    GRID_SIZE - 1
  );

  // Vẽ thức ăn thường
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(
    gameState.food.x * GRID_SIZE,
    gameState.food.y * GRID_SIZE,
    GRID_SIZE - 1,
    GRID_SIZE - 1
  );

  // Vẽ thức ăn lớn (2x2)
  if (gameState.bigFood) {
    ctx.fillStyle = "#FFD700";
    // Vẽ 4 ô cho thức ăn lớn
    ctx.fillRect(
      gameState.bigFood.x * GRID_SIZE,
      gameState.bigFood.y * GRID_SIZE,
      GRID_SIZE * 2 - 1,
      GRID_SIZE * 2 - 1
    );
  }

  // Vẽ chướng ngại vật
  ctx.fillStyle = "#666";
  gameState.obstacles.forEach((obs) => {
    ctx.fillRect(
      obs.x * GRID_SIZE,
      obs.y * GRID_SIZE,
      GRID_SIZE - 1,
      GRID_SIZE - 1
    );
  });
}

// Xử lý phím
function handleKeyPress(event) {
  // Ngăn chặn cuộn trang khi dùng phím mũi tên
  if ([37, 38, 39, 40].includes(event.keyCode)) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định
  }

  const newDirection = DIRECTIONS[event.keyCode];
  if (newDirection) {
    // Ngăn rắn quay đầu 180 độ
    if (
      Math.abs(newDirection.x) !== Math.abs(gameState.direction.x) ||
      Math.abs(newDirection.y) !== Math.abs(gameState.direction.y)
    ) {
      gameState.direction = newDirection;
    }
  }
}

// Cập nhật điểm
function updateScore() {
  document.getElementById("score").textContent = `Score: ${gameState.score}`;
  updateSpeed(); // Kiểm tra và cập nhật tốc độ
}

// Game over
function gameOver() {
  clearInterval(gameState.gameLoop);
  alert(`Game Over! Score: ${gameState.score}`);
  showMenu();
}

// Tạm dừng game
function pauseGame() {
  gameState.isPaused = !gameState.isPaused;
}

// Reset game
function resetGame() {
  initGame();
}

// Hiển thị menu
function showMenu() {
  clearInterval(gameState.gameLoop);
  document.getElementById("game-screen").classList.remove("active");
  document.getElementById("menu-screen").classList.add("active");
}

// Khởi tạo game khi trang web load xong
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("menu-screen").classList.add("active");
});

// Thêm hàm cập nhật tốc độ
function updateSpeed() {
  // Tìm mức tốc độ phù hợp với điểm số hiện tại
  let newSpeed = SPEED_LEVELS[0].interval;
  for (let speedLevel of SPEED_LEVELS) {
    if (gameState.score >= speedLevel.score) {
      newSpeed = speedLevel.interval;
    }
  }

  // Nếu tốc độ thay đổi, cập nhật game loop
  if (newSpeed !== gameState.currentSpeed) {
    gameState.currentSpeed = newSpeed;
    if (gameState.gameLoop) {
      clearInterval(gameState.gameLoop);
      gameState.gameLoop = setInterval(gameLoop, gameState.currentSpeed);
    }

    // Hiển thị thông báo tăng tốc
    showSpeedUpMessage();
  }
}

// Thêm hàm hiển thị thông báo tăng tốc
function showSpeedUpMessage() {
  const message = document.createElement("div");
  message.textContent = "Speed Up!";
  message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 255, 0, 0.8);
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
        animation: fadeOut 1s forwards;
        z-index: 1000;
    `;

  document.body.appendChild(message);
  setTimeout(() => message.remove(), 1000);
}

// Thêm style cho animation
const style = document.createElement("style");
style.textContent += `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
