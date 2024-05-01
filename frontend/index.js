const socket = io();
const TILE_SIZE = 12;

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
   socket.emit("joinGame", nickname);

   // Listen for game state updates
   socket.on("gameState", (gameState) => {
      let canvas = document.getElementById("canvas");
      canvas.height = TILE_SIZE * gameState.map.length + 1;
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