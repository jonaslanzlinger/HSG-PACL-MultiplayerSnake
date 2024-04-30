const Player = require("./Player.js");

const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();

// Create server on port 1337
const server = app.listen(1337, () => {
   console.log(`Express running → PORT ${server.address().port}`);
});

// Serve static files in frontend folder
app.use(express.static(path.resolve(__dirname, "../frontend")));

// Serve index.html for all routes
app.get("/", (req, res) => {
   res.sendFile(path.resolve(__dirname, "../frontend", "index.html"));
});

//////////////////////
// Socket.io server //
//////////////////////

// Mount socket.io on the server
const io = socketio(server);

// Listen socket.io events
io.on("connection", (socket) => {
   console.log("User: " + socket.id + " connected");
   let player = null;

   // Listen for joinGame event
   socket.on("joinGame", (nickname) => {
      console.log(nickname + " joined the game");
      // TODO assign unique player number to each new player
      let nextPlayerNumber = 1;
      player = new Player(socket, nickname, nextPlayerNumber);
      players.push(player);
   });

   // Listen for user input
   socket.on("userInput", (userInput) => {
      player.setDirection(userInput);
   });

   // Remove player from players array when disconnected
   socket.on("disconnect", () => {
      console.log("User: " + socket.id + " disconnected");
      players = players.filter((p) => p.socket.id !== socket.id);
   });
});

//////////////////////
// Game logic       //
//////////////////////
let FPS = 10;
let players = [];

// State of the game map
let mapSize = 60;
// Init map
let map = new Array(mapSize).fill(0).map(() => new Array(mapSize).fill(0));

// Complete game state
let gameState = {
   map: map,
};

// Update game state
function updateGameState() {
   // Update player positions
   players.forEach((player) => {
      player.move();

      // Remove player from map if player collides with wall or other player
      if (collides(player)) {
         players = players.filter((p) => p !== player);
      }

      // re-initialize map
      map = new Array(mapSize).fill(0).map(() => new Array(mapSize).fill(0));

      // Write players to map
      players.forEach((p) => {
         p.snake.forEach((s) => {
            map[s.x][s.y] = p.playerNumber;
         });
         map[p.snake[0].x][p.snake[0].y] = -p.playerNumber;
      });

      // Update game state
      gameState.map = map;
   });
}

// Game loop
function startGameLoop() {

   setInterval(() => {

      // Update game state
      updateGameState();

      // Emit game state to all clients
      io.emit("gameState", gameState);

   }, 1000 / FPS);
}

function collides(player) {
   // TODO check if player collides with wall
   return false;
}

// Start the game loop
startGameLoop();
