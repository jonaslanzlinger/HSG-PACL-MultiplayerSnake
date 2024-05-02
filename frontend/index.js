const SocketConfig = require("../configs/socketConfig.js");
const FrontendConfig = require("../configs/frontendConfig.js");

const socket = io();

function startGame() {
   document.getElementById("login").style.display = "none";
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
   for (var x = 0.5; x < canvas.width; x += FrontendConfig.TILE_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
   }
   for (var y = 0.5; y < canvas.height; y += FrontendConfig.TILE_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
   }
   ctx.stroke()
}

// Init socket
function initSocket(nickname) {
   socket.emit(SocketConfig.EVENTS.JOIN_GAME, nickname);

   // Listen for game state updates
   socket.on(SocketConfig.EVENTS.GAME_STATE, (gameState) => {

      updateLeaderboard(gameState.map);

      let canvas = document.getElementById("canvas");
      canvas.height = FrontendConfig.TILE_SIZE * gameState.map.length + 1;
      canvas.width = canvas.height;
      ctx.beginPath();
      setBackground('#fff', '#ccc');

      // Draw map
      for (let y = 0; y < gameState.map.length; y++) {
         for (let x = 0; x < gameState.map[y].length; x++) {
            if (gameState.map[y][x] !== 0) {
               //TODO: improve switch to efficiently handle all map fields
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
                  default:
                     //TODO: nothing should be orange, so be careful if you see that on the map. handle better
                     ctx.fillStyle = "orange";
                     break;
               }

               ctx.fillRect(y * FrontendConfig.TILE_SIZE, x * FrontendConfig.TILE_SIZE, FrontendConfig.TILE_SIZE, FrontendConfig.TILE_SIZE);
            }
         }
      }
   });

   // Listen for game state updates
   socket.on(SocketConfig.EVENTS.GAME_OVER, (gameState) => {
      //TODO: handle game over
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
   socket.emit(SocketConfig.EVENTS.USER_INPUT, userInput);
}