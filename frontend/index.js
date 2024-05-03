let socket = null;
const TILE_SIZE = 12;
let playerNumber = null;

function startGame() {
   document.getElementById("login").style.display = "none";
   document.getElementById("final-score-value").style.display = "block";
   document.getElementById("game").style.display = "block";
   let nickname = document.getElementById("nickname").value;

   initSocket(nickname);
   initKeyControls();
   initMap();
}

function setBackground(color1, color2) {
   ctx.fillStyle = color1;
   ctx.strokeStyle = color2;
   ctx.fillRect(0, 0, canvas.height, canvas.width);
   for (var x = 0.5; x < canvas.width; x += TILE_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
   }
   for (var y = 0.5; y < canvas.height; y += TILE_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
   }
   ctx.stroke()
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
      if (gameState.players.find(player => player.playerNumber === this.playerNumber).gameOver) {
         document.getElementById("login").style.display = "block";
         document.getElementById("game").style.display = "none";
         document.getElementById("final-score-value").innerText =
            `Final Score: ${gameState.players.find(player => player.playerNumber === this.playerNumber).score}`;
         socket.emit("forceDisconnect");
         return;
      }

      updateLeaderboard(gameState);

      //TODO: add field which shows powerups in inventory (picked up)
      //TODO: add field which shows currently active powerup? -> also show timer that decreases on frontend! Example: See INVERSE_OTHER_PLAYERS_MOVEMENT_MS that defines how lung the debuff is active
      //TODO: handle all powerUp states -> See Player.activePowerUp and Player.activeDebuffs
      //TODO: mark visually when player has a debuff (e.g. Inverser makes movement inverse for player)
      //TODO: add visuals for spawnInvulnerability (currently same visual as for Star.js -> see Player.snakeInvulnerability)

      //TODO: probably much more. For hints, check all todos in backend and what is sent to frontend in Player.getPlayerGameState

      let canvas = document.getElementById("canvas");
      canvas.height = TILE_SIZE * gameState.map.length + 1;
      canvas.width = canvas.height;
      ctx.beginPath();
      setBackground('#fff', '#ccc');

      // Draw map
      for (let y = 0; y < gameState.map.length; y++) {
         for (let x = 0; x < gameState.map[y].length; x++) {
            if (gameState.map[y][x] !== 0) {
               //TODO: Make displayed fields nicer -> e.g. use apple for apple fields instead of just a green field, etc.
               switch (true) {
                  //field: snake body
                  case gameState.map[y][x] > 0:
                     ctx.fillStyle = "grey";
                     break;
                  //field: snake head
                  case gameState.map[y][x] < 0:
                     ctx.fillStyle = "red";
                     break;
                  //field: apple
                  case gameState.map[y][x] === "a":
                     ctx.fillStyle = "green";
                     break;
                  //field: obstacle
                  case gameState.map[y][x] === "o":
                     ctx.fillStyle = "black";
                     break;
                  //powerup field: star
                  //TODO: move field identifiers to common config (see configs folder -> some things are necessary for both backend and frontend (not super important))
                  case gameState.map[y][x] === "ps":
                     ctx.fillStyle = "yellow";
                     break;
                  //powerup field: inverser
                  case gameState.map[y][x] === "pi":
                     ctx.fillStyle = "purple";
                     break;
                  default:
                     //TODO: nothing should be orange, so be careful if you see that on the map. handle better
                     ctx.fillStyle = "orange";
                     break;
               }

               ctx.fillRect(y * TILE_SIZE, x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
         }
      }
   });
}

// Init key controls
function initKeyControls() {
   document.addEventListener("keydown", (event) => {
      switch (event.key) {
         case "w":
            sendUserInput("w");
            break;
         case "a":
            sendUserInput("a");
            break;
         case "s":
            sendUserInput("s");
            break;
         case "d":
            sendUserInput("d");
            break;
         case " ": //send powerUp (p) when spacebar is pressed
            sendUserInput("p");
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