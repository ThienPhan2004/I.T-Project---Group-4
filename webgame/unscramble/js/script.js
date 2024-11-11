const wordText = document.querySelector(".word"),
  hintText = document.querySelector(".hint span"),
  timeText = document.querySelector(".time b"),
  inputField = document.querySelector("input"),
  refreshBtn = document.querySelector(".refresh-word"),
  checkBtn = document.querySelector(".check-word"),
  messageElement = document.getElementById("message"),
  scoreText = document.querySelector(".score b"),
  wordTextContainer = document.querySelector(".scrambled-letters-container"),
  showAnswerBtn = document.querySelector(".show-answer"),
  difficultySelector = document.getElementById("difficulty");

let score = 0;
let correctWord;
let totalTime = 60; // Total game time in seconds
let timer;

// Start the 1-minute game timer
const startGameTimer = () => {
  let timeRemaining = totalTime;
  timer = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      timeText.innerText = `${timeRemaining}`; // Show time in seconds
    } else {
      clearInterval(timer);
      endGame(); // End game when time runs out
    }
  }, 1000);
};

// Get words filtered by difficulty
const getFilteredWords = () => {
  const selectedDifficulty = difficultySelector.value;
  let filteredWords = words.filter((wordObj) => wordObj.difficulty === selectedDifficulty);

  // Further filter words based on word length for additional difficulty tuning
  if (selectedDifficulty === "Easy") {
    filteredWords = filteredWords.filter((wordObj) => wordObj.word.length <= 5);
  } else if (selectedDifficulty === "Medium") {
    filteredWords = filteredWords.filter((wordObj) => wordObj.word.length >= 5 && wordObj.word.length <= 7);
  } else if (selectedDifficulty === "Hard") {
    filteredWords = filteredWords.filter((wordObj) => wordObj.word.length > 7);
  }
  return filteredWords;
};

// Shuffle and display scrambled letters
const shuffleWord = (word) => {
  let scrambledWord = word.split("");

  // Shuffle the word until it is different from the original
  do {
    scrambledWord.sort(() => Math.random() - 0.5);
  } while (scrambledWord.join("") === word);

  return scrambledWord.join("");
};

const initGame = () => {
  const filteredWords = getFilteredWords();
  if (filteredWords.length === 0) {
    alert(`No words available for "${difficultySelector.value}" level!`);
    return;
  }

  // Reset the message
  messageElement.textContent = ""; // Clear previous messages
  messageElement.classList.remove("correct", "incorrect"); // Reset classes

  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  const randomObj = filteredWords[randomIndex];

  correctWord = randomObj.word.toLowerCase();
  hintText.innerText = randomObj.hint;

  // Shuffle the word and ensure it is different from the original
  let scrambledWord = shuffleWord(correctWord);

  // Display scrambled letters
  wordTextContainer.innerHTML = scrambledWord
    .split("")
    .map((letter) => `<div class="letter-box">${letter}</div>`)
    .join("");

  inputField.value = ""; // Clear input
};


// Handle checking the word when "Enter" is pressed
inputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkWord();
  }
});

// Check user's input
const checkWord = () => {
  let userWord = inputField.value.toLowerCase();
  if (!userWord) {
    messageElement.textContent = "Please enter the word to check!";
    return;
  }

  // Reset message classes
  messageElement.classList.remove("correct", "incorrect");

  if (userWord !== correctWord) {
    inputField.classList.remove("correct");
    inputField.classList.add("incorrect");
    messageElement.classList.add("incorrect");
    messageElement.textContent = "Oops! Try again.";
    return;
  }

  // If correct
  inputField.classList.remove("incorrect");
  inputField.classList.add("correct");
  messageElement.classList.add("correct");
  messageElement.textContent = `Yay, ${correctWord.toUpperCase()} is the correct word!`;

  score += 10; // Increment score for a correct answer
  scoreText.innerText = score;
  setTimeout(initGame, 2000);
};

// Show the correct answer when the "Show Answer" button is clicked
showAnswerBtn.addEventListener("click", () => {
  messageElement.innerHTML = `The correct word is: <span style="color: red; font-size: 24px; font-weight: bold;">${correctWord.toUpperCase()}</span>`;
  inputField.style.display = "none";

  setTimeout(() => {
    initGame();
    inputField.style.display = "block";
    inputField.style.margin = "0 auto";
    messageElement.innerHTML = "";
  }, 2000);
});

// End the game and display the final score
const endGame = () => {
  messageElement.innerHTML = `Time's up! Your final score is: <span style="font-size: 24px; color: red;">${score}</span>`;
  inputField.style.display = "none";
  showEndOptions(); // Show end options as a pop-up
};

// Show options to start a new game or return to the menu as a pop-up
const showEndOptions = () => {
  const endOverlay = document.createElement("div");
  endOverlay.classList.add("end-overlay"); // Use CSS to style this

  const endBox = document.createElement("div");
  endBox.classList.add("end-box");

  const finalScore = document.createElement("p");
  finalScore.innerHTML = `Final Score: <span style="font-size: 24px; color: red;">${score}</span>`;
  endBox.appendChild(finalScore);

  const newGameButton = document.createElement("button");
  newGameButton.textContent = "New Game";
  newGameButton.classList.add("new-game-btn");
  newGameButton.onclick = () => {
    startNewGame();
    endOverlay.remove();
  };

  const menuButton = document.createElement("button");
  menuButton.textContent = "Back to Menu";
  menuButton.classList.add("menu-btn");
  menuButton.onclick = () => {
    goToMenu();
    endOverlay.remove();
  };

  endBox.appendChild(newGameButton);
  endBox.appendChild(menuButton);
  endOverlay.appendChild(endBox);
  document.body.appendChild(endOverlay);
};

refreshBtn.addEventListener("click", initGame);

// Start a new game
const startNewGame = () => {
  clearInterval(timer); // Clear any existing timers
  score = 0;
  scoreText.innerText = score;
  document.querySelector(".end-overlay")?.remove(); // Remove end options overlay
  inputField.style.display = "block"; // Show the input field again
  inputField.value = ""; // Clear the input field
  messageElement.textContent = ""; // Clear any previous messages
  startGameTimer(); // Start the 1-minute timer
  initGame(); // Initialize a new game
};

const goToMenu = () => {
  window.location.href = "/index.html#game-menu"; // Adjust path if needed
};

// Change game on difficulty change
difficultySelector.addEventListener("change", () => {
  startNewGame();
});

// Start the timer when the page loads
startGameTimer();
initGame();
