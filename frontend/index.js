let socket = null;
let prevGameState = null;
let playerNumber = null;
let player = null;
let camera = null;
let gameAudio = null;
let tileSize = null;
let cameraWidth = null;
let cameraHeight = null;

// Constants
const SIDEBAR_WIDTH = 250;
const MAX_TILES = 40;
const cameraThreshold = 7;

// Initialize images for drawing
// Only need to load once
const AppleImage = new Image();
const StarImage = new Image();
const InverserImage = new Image();
const SnakeEaterImage = new Image();
const ObstacleImage = new Image();
const ShieldImage = new Image();
AppleImage.src = "/assets/apple.svg";
StarImage.src = "/assets/star.svg";
SnakeEaterImage.src = "/assets/snake_eater.svg";
InverserImage.src = "/assets/inverser.svg";
ObstacleImage.src = "/assets/obstacle.svg";
ShieldImage.src = "/assets/shield.svg";

// Snake colors
// [head, body, text]
const snakeColors = [
  ["#0000ff", "#7a7aff", "#ffffff"],
  ["#ff0000", "#ff7a7a", "#ffffff"],
  ["#ffd700", "#fbe87e", "#111111"],
  ["#9ae91c", "#c7fb74", "#111111"],
  ["#1cf29c", "#85ffce", "#111111"],
  ["#9b30f2", "#c583fb", "#ffffff"],
  ["#322f36", "#68666b", "#ffffff"],
  ["#00bfff", "#8fe3ff", "#ffffff"],
  ["#f2991c", "#ffc370", "#111111"],
  ["#ff338b", "#ff7ab4", "#ffffff"],
  ["#196b1b", "#59915a", "#ffffff"],
  ["#232277", "#56558b", "#ffffff"],
  ["#806452", "#bea293", "#ffffff"],
  ["#800080", "#c665c8", "#ffffff"],
  ["#a7320c", "#db7c5c", "#ffffff"],
];

// Initialize audio
gameAudio = new GameAudio();
initKeyControls();

// Start the game
function startGame() {
  // If landscape mode
  if (window.innerHeight < (window.innerWidth - SIDEBAR_WIDTH)) {
    tileSize = Math.floor((window.innerWidth - SIDEBAR_WIDTH) / MAX_TILES);
    cameraWidth = MAX_TILES;
    cameraHeight = Math.floor(window.innerHeight / tileSize);
  // If portrait mode
  } else {
    tileSize = Math.floor(window.innerHeight / MAX_TILES);
    cameraWidth = Math.floor((window.innerWidth - SIDEBAR_WIDTH) / tileSize);
    cameraHeight = MAX_TILES;
  }

  document.getElementById("login").style.display = "none";
  document.getElementById("final-score-value").style.display = "block";
  document.getElementById("game").style.display = "grid";
  let nickname = document.getElementById("nickname").value;

  initSocket(nickname);
  initMap();
  gameAudio.playMusic();
}

/**
 * Sets the background color of the canvas and draws a grid.
 *
 * @param {string} color1 - The color to fill the canvas.
 * @param {string} color2 - The color of the grid lines.
 * @return {void} This function does not return a value.
 */
function setBackground(color1, color2) {
  ctx.fillStyle = color1;
  ctx.strokeStyle = color2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var x = 0.5; x < canvas.width; x += tileSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (var y = 0.5; y < canvas.height; y += tileSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
}

// Init socket
function initSocket(nickname) {
  socket = io();

  socket.emit("joinGame", nickname);

  // Lister for player number
  socket.on("playerNumber", (playerNumber) => {
    this.playerNumber = playerNumber;
  });

  // Listen for game state updates
  socket.on("gameState", (gameState) => {
    // If player is dead, return to login screen
    if (
      gameState.players.find(
        (player) => player.playerNumber === this.playerNumber
      ).gameOver
    ) {
      gameAudio.stopMusic();

      document.getElementById("login").style.display = "block";
      document.getElementById("game").style.display = "none";
      document.getElementById("final-score-value").innerText = `Final Score: ${gameState.players.find(
        (player) => player.playerNumber === this.playerNumber
      ).score
        }`;

      // Reset camera
      camera = null;
      // Reset background
      setBackground("#fff", "#ccc");

      socket.emit("forceDisconnect");
      return;
    }

    // Update player state
    this.player = gameState.players.find(
      (player) => player.playerNumber === this.playerNumber
    );

    // Play inverter sound effect if enemy has inverter powerup activated
    if (this.player.activeDebuffs.length < gameState.players.find(player => player.playerNumber === this.playerNumber).activeDebuffs.length) {
      gameAudio.playInverterSound();
    }

    // Update leaderboard
    updateLeaderboard(gameState);
    updatePowerups(this.player);
    updateBuffs(this.player);
    updateDebuffs(this.player);

    let canvas = document.getElementById("canvas");
    canvas.width = tileSize * cameraWidth + 1;
    canvas.height = tileSize * cameraHeight + 1;
    // canvas.height = tileSize * cameraHeight + 1;
    // canvas.width = tileSize * cameraWidth + 1;
    ctx.beginPath();
    setBackground("#fff", "#ccc");

    if (!this.playerNumber) {
      return;
    }

    if (!camera) {
      // Init camera
      camera = new Camera(
        gameState.map,
        this.playerNumber,
        cameraWidth,
        cameraHeight,
        cameraThreshold
      );
    } else {
      // Update camera with new map state, i.e. move camera if needed
      camera.update(gameState.map);
    }

    let player = gameState.players.find(
      (p) => p.playerNumber === this.playerNumber
    );

    // Draw map
    for (let x = camera.x; x < camera.x + camera.width; x++) {
      for (let y = camera.y; y < camera.y + camera.height; y++) {
        if (gameState.map[x][y] !== 0) {
          switch (true) {
            //field: snake body
            case gameState.map[x][y] > 0:
              ctx.fillStyle =
                snakeColors[(gameState.map[x][y] - 1) % snakeColors.length][
                player?.activeDebuffs.includes("pi") ? 0 : 1
                ];

              ctx.fillRect(
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
            //field: snake head
            case gameState.map[x][y] < 0:
              ctx.fillStyle =
                snakeColors[
                (gameState.map[x][y] * -1 - 1) % snakeColors.length
                ][player?.activeDebuffs.includes("pi") ? 1 : 0];
              ctx.fillRect(
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              // Check if sounds should be played for my snake
              if (
                gameState.map[x][y] === -this.playerNumber &&
                prevGameState !== null
              ) {
                gameAudio.playSoundByFieldType(prevGameState[x][y], player);
              }

              if (player?.activePowerUps.includes("ps")) {
                ctx.drawImage(
                  ShieldImage,
                  (x - camera.x) * tileSize,
                  (y - camera.y) * tileSize,
                  tileSize,
                  tileSize
                );
              }
              break;
            //field: apple
            case gameState.map[x][y] === "a":
              ctx.drawImage(
                AppleImage,
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
            //field: obstacle
            case gameState.map[x][y] === "o":
              ctx.drawImage(
                ObstacleImage,
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
            //powerup field: star
            case gameState.map[x][y] === 'ps':
            //TODO: move field identifiers to common config (see configs folder -> some things are necessary for both backend and frontend (not super important))
            case gameState.map[x][y] === "ps":
              ctx.drawImage(
                StarImage,
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
            //powerup field: inverser
            case gameState.map[x][y] === "pi":
              ctx.drawImage(
                InverserImage,
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
            //powerup field: snake eater
            case gameState.map[x][y] === "pe":
              ctx.drawImage(
                SnakeEaterImage,
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
            default:
              // nothing should be orange, so be careful if you see that on the map. handle better
              ctx.fillStyle = "orange";
              ctx.fillRect(
                (x - camera.x) * tileSize,
                (y - camera.y) * tileSize,
                tileSize,
                tileSize
              );
              break;
          }
        }
      }
    }

    // Save previous game state
    prevGameState = gameState.map;

    // Draw map bounds left
    if (camera.x === 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Draw map bounds right
    if (camera.x + camera.width === gameState.map.length) {
      ctx.beginPath();
      ctx.moveTo(canvas.width, 0);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Draw map bounds top
    if (camera.y === 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Draw map bounds bottom
    if (camera.y + camera.height === gameState.map[0].length) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  });
}

// Init key controls
function initKeyControls() {
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "w":
      case "ArrowUp":
        sendUserInput("w");
        break;
      case "a":
      case "ArrowLeft":
        sendUserInput("a");
        break;
      case "s":
      case "ArrowDown":
        sendUserInput("s");
        break;
      case "d":
      case "ArrowRight":
        sendUserInput("d");
        break;
      case "1": // send powerUp (ps) when '1' is pressed
        if (this.player.powerUpInventory.includes("ps")) {
          sendUserInput("ps");
          gameAudio.playStar();
        } else {
          gameAudio.playInventoryError();
        }
        break;
      case "2": // send powerUp (pi) when '2' is pressed
        if (this.player.powerUpInventory.includes("pi")) {
          sendUserInput("pi");
          gameAudio.playInverser();
        } else {
          gameAudio.playInventoryError();
        }
        break;
      case '3': // send powerUp (pe) when '3' is pressed
        if (this.player.powerUpInventory.includes('pe')) {
          sendUserInput('pe')
          gameAudio.playSnakeEaterSound();
        } else {
          gameAudio.playInventoryError();
        }
        break;
    }
  });
}

// Init map
function initMap() {
  let canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  canvas.setAttribute("tabindex", 1);
  canvas.style.outline = "none";
  canvas.focus();
}

// Send user input
function sendUserInput(userInput) {
  socket.emit("userInput", userInput);
}
