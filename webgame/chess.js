// Khởi tạo các biến toàn cục
let gameState = {
  board: null,
  currentPlayer: "white",
  selectedPiece: null,
  gameMode: null, // 'pvp' hoặc 'pvc'
  validMoves: [],
  kings: { white: null, black: null },
  isCheck: { white: false, black: false },
};

// Unicode cho các quân cờ
const PIECES = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

// Khởi tạo bàn cờ
function initializeBoard() {
  const initialBoard = Array(8)
    .fill()
    .map(() => Array(8).fill(null));

  // Đặt quân cờ trắng
  initialBoard[7] = [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ];
  initialBoard[6] = Array(8)
    .fill()
    .map(() => ({ type: "pawn", color: "white" }));

  // Đặt quân cờ đen
  initialBoard[0] = [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ];
  initialBoard[1] = Array(8)
    .fill()
    .map(() => ({ type: "pawn", color: "black" }));

  return initialBoard;
}

// Khởi tạo game
function startGame(mode) {
  gameState.gameMode = mode;
  gameState.board = initializeBoard();
  gameState.currentPlayer = "white";
  gameState.selectedPiece = null;
  gameState.validMoves = [];

  gameState.kings = {
    white: { row: 7, col: 4 },
    black: { row: 0, col: 4 },
  };

  gameState.isCheck = { white: false, black: false };

  document.getElementById("menu-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  renderBoard();
  updateGameInfo();
}

// Vẽ bàn cờ
function renderBoard() {
  const chessboard = document.getElementById("chessboard");
  chessboard.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.className = `square ${(row + col) % 2 === 0 ? "white" : "black"}`;

      const piece = gameState.board[row][col];
      if (piece) {
        square.textContent = PIECES[piece.color][piece.type];
      }

      square.addEventListener("click", () => handleSquareClick(row, col));
      chessboard.appendChild(square);
    }
  }

  // Highlight các ô được chọn và nước đi hợp lệ
  if (gameState.selectedPiece) {
    const squares = document.querySelectorAll(".square");
    const selectedIndex =
      gameState.selectedPiece.row * 8 + gameState.selectedPiece.col;
    squares[selectedIndex].classList.add("selected");

    gameState.validMoves.forEach((move) => {
      squares[move.row * 8 + move.col].classList.add("valid-move");
    });
  }
}

// Xử lý click vào ô cờ
function handleSquareClick(row, col) {
  const piece = gameState.board[row][col];

  // Nếu đã chọn quân cờ trước đó
  if (gameState.selectedPiece) {
    const validMove = gameState.validMoves.some(
      (move) => move.row === row && move.col === col
    );

    if (validMove) {
      makeMove(gameState.selectedPiece, row, col);
    }

    clearSelection();
    return;
  }

  // Chọn quân cờ mới
  if (piece && piece.color === gameState.currentPlayer) {
    selectPiece(row, col);
  }
}

// Chọn quân cờ
function selectPiece(row, col) {
  gameState.selectedPiece = { row, col };
  gameState.validMoves = getValidMoves(row, col);
  renderBoard();
}

// Xóa selection
function clearSelection() {
  gameState.selectedPiece = null;
  gameState.validMoves = [];
  renderBoard();
}

// Thực hiện nước đi
function makeMove(from, toRow, toCol) {
  const piece = gameState.board[from.row][from.col];
  const capturedPiece = gameState.board[toRow][toCol];

  // Kiểm tra ăn vua
  if (capturedPiece && capturedPiece.type === "king") {
    gameState.board[toRow][toCol] = piece;
    gameState.board[from.row][from.col] = null;
    renderBoard();
    showGameOver(piece.color);
    return;
  }

  // Di chuyển quân cờ
  gameState.board[toRow][toCol] = piece;
  gameState.board[from.row][from.col] = null;

  // Cập nhật vị trí vua
  if (piece.type === "king") {
    gameState.kings[piece.color] = { row: toRow, col: toCol };
  }

  // Chuyển lượt
  gameState.currentPlayer =
    gameState.currentPlayer === "white" ? "black" : "white";

  // Kiểm tra chiếu tướng
  checkForCheck();

  // Kiểm tra chiếu hết sau mỗi nước đi
  if (isCheckmate()) {
    showGameOver(piece.color);
    return;
  }
  // Cập nhật giao diện
  renderBoard();
  updateGameInfo();

  // Nếu đang chơi với máy và đến lượt máy
  if (gameState.gameMode === "pvc" && gameState.currentPlayer === "black") {
    setTimeout(makeComputerMove, 500);
  }
}
// Lấy các nước đi hợp lệ
function getValidMoves(row, col) {
  const piece = gameState.board[row][col];
  const moves = [];

  if (!piece) return moves;

  switch (piece.type) {
    case "pawn":
      getPawnMoves(row, col, piece.color, moves);
      break;
    case "rook":
      getRookMoves(row, col, piece.color, moves);
      break;
    case "knight":
      getKnightMoves(row, col, piece.color, moves);
      break;
    case "bishop":
      getBishopMoves(row, col, piece.color, moves);
      break;
    case "queen":
      getQueenMoves(row, col, piece.color, moves);
      break;
    case "king":
      getKingMoves(row, col, piece.color, moves);
      break;
  }

  return moves;
}

// Kiểm tra nước đi có hợp lệ
function isValidMove(fromRow, fromCol, toRow, toCol) {
  // Kiểm tra có nằm trong bàn cờ
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
    return false;
  }

  const piece = gameState.board[fromRow][fromCol];
  const targetSquare = gameState.board[toRow][toCol];

  // Không thể đi vào ô có quân cùng màu
  if (targetSquare && targetSquare.color === piece.color) {
    return false;
  }

  return true;
}

// Nước đi của tốt
function getPawnMoves(row, col, color, moves) {
  const direction = color === "white" ? -1 : 1;
  const startRow = color === "white" ? 6 : 1;

  // Đi thẳng 1 ô
  if (!gameState.board[row + direction]?.[col]) {
    if (isValidMove(row, col, row + direction, col)) {
      moves.push({ row: row + direction, col: col });

      // Đi thẳng 2 ô từ vị trí ban đầu
      if (row === startRow && !gameState.board[row + 2 * direction]?.[col]) {
        moves.push({ row: row + 2 * direction, col: col });
      }
    }
  }

  // Ăn chéo
  [-1, 1].forEach((offset) => {
    const newCol = col + offset;
    if (isValidMove(row, col, row + direction, newCol)) {
      const target = gameState.board[row + direction]?.[newCol];
      if (target && target.color !== color) {
        moves.push({ row: row + direction, col: newCol });
      }
    }
  });
}

// Nước đi của xe
function getRookMoves(row, col, color, moves) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  directions.forEach(([rowDir, colDir]) => {
    let newRow = row + rowDir;
    let newCol = col + colDir;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (!isValidMove(row, col, newRow, newCol)) break;

      moves.push({ row: newRow, col: newCol });

      if (gameState.board[newRow][newCol]) break;

      newRow += rowDir;
      newCol += colDir;
    }
  });
}

// Nước đi của mã
function getKnightMoves(row, col, color, moves) {
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  knightMoves.forEach(([rowOffset, colOffset]) => {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;

    if (isValidMove(row, col, newRow, newCol)) {
      moves.push({ row: newRow, col: newCol });
    }
  });
}

// Nước đi của tượng
function getBishopMoves(row, col, color, moves) {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  directions.forEach(([rowDir, colDir]) => {
    let newRow = row + rowDir;
    let newCol = col + colDir;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (!isValidMove(row, col, newRow, newCol)) break;

      moves.push({ row: newRow, col: newCol });

      if (gameState.board[newRow][newCol]) break;

      newRow += rowDir;
      newCol += colDir;
    }
  });
}

// Nước đi của hậu
function getQueenMoves(row, col, color, moves) {
  getRookMoves(row, col, color, moves);
  getBishopMoves(row, col, color, moves);
}

// Nước đi của vua
function getKingMoves(row, col, color, moves) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  directions.forEach(([rowOffset, colOffset]) => {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;

    if (isValidMove(row, col, newRow, newCol)) {
      moves.push({ row: newRow, col: newCol });
    }
  });
}
// Kiểm tra chiếu tướng
function checkForCheck() {
  const currentKing = gameState.kings[gameState.currentPlayer];
  const opponentColor = gameState.currentPlayer === "white" ? "black" : "white";

  // Kiểm tra tất cả các quân của đối thủ
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMoves(row, col);
        if (
          moves.some(
            (move) =>
              move.row === currentKing.row && move.col === currentKing.col
          )
        ) {
          gameState.isCheck[gameState.currentPlayer] = true;
          return true;
        }
      }
    }
  }

  gameState.isCheck[gameState.currentPlayer] = false;
  return false;
}

// AI cho máy tính
function makeComputerMove() {
  let bestMove = null;
  let bestScore = -Infinity;

  // Duyệt tất cả các nước đi có thể
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === "black") {
        const moves = getValidMoves(row, col);
        moves.forEach((move) => {
          // Lưu trạng thái hiện tại
          const tempBoard = JSON.parse(JSON.stringify(gameState.board));
          const tempKings = JSON.parse(JSON.stringify(gameState.kings));

          // Thử nước đi
          makeMove({ row, col }, move.row, move.col);

          // Đánh giá nước đi
          const score = evaluatePosition();

          // Khôi phục trạng thái
          gameState.board = tempBoard;
          gameState.kings = tempKings;
          gameState.currentPlayer = "black";

          if (score > bestScore) {
            bestScore = score;
            bestMove = { from: { row, col }, to: move };
          }
        });
      }
    }
  }
  // Thực hiện nước đi tốt nhất
  if (bestMove) {
    makeMove(bestMove.from, bestMove.to.row, bestMove.to.col);
  }
}
// Đánh giá vị trí
function evaluatePosition() {
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100,
  };
  let score = 0;
  // Tính điểm dựa trên giá trị quân cờ
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === "black" ? value : -value;
      }
    }
  }
  // Thêm điểm cho vị trí trung tâm
  const centerSquares = [
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ];
  centerSquares.forEach(([row, col]) => {
    const piece = gameState.board[row][col];
    if (piece) {
      score += piece.color === "black" ? 0.3 : -0.3;
    }
  });
  return score;
}
// Cập nhật thông tin game
function updateGameInfo() {
  const turnText = document.getElementById("current-turn");
  turnText.textContent = `${
    gameState.currentPlayer.charAt(0).toUpperCase() +
    gameState.currentPlayer.slice(1)
  }'s turn`;
  if (gameState.isCheck[gameState.currentPlayer]) {
    turnText.textContent += " (Check!)";
  }
}
// Hiển thị menu
function showMenu() {
  hideGameOver();
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("menu-screen").style.display = "block";
}
// Reset game
function resetGame() {
  hideGameOver();
  startGame(gameState.gameMode);
}
// Kiểm tra chiếu hết
function isCheckmate() {
  // Kiểm tra tất cả các nước đi có thể của người chơi hiện tại
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentPlayer) {
        const moves = getValidMoves(row, col);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }
  // Nếu đang bị chiếu và không có nước đi hợp lệ => chiếu hết
  return gameState.isCheck[gameState.currentPlayer];
}
// Hiển thị thông báo kết thúc game
function showGameOver(winner) {
  const modal = document.getElementById("game-over-modal");
  const winnerText = document.getElementById("winner-text");
  const overlay = document.getElementById("overlay");
  winnerText.textContent = `${winner} wins!`;
  modal.style.display = "block";
  overlay.style.display = "block";
}
// Ẩn thông báo kết thúc game
function hideGameOver() {
  const modal = document.getElementById("game-over-modal");
  const overlay = document.getElementById("overlay");
  modal.style.display = "none";
  overlay.style.display = "none";
}
