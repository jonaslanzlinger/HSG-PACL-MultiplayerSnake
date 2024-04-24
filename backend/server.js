const express = require("express");
const socketio = require("socket.io");
const app = express();
const path = require("path");

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

   socket.on("userInput", (data) => {
      console.log(data);
   });
});

//////////////////////
// Game logic       //
//////////////////////

// State of the game map
let map = [
   [0, 0, 0],
   [0, 0, 0],
   [0, 0, 0],
];

// Complete game state
let gameState = {
   map: map,
};

// Update game state
function updateGameState() {
   map[0][0] = map[0][0] == 0 ? 1 : 0;
}

// Game loop
function startGameLoop() {
   setInterval(() => {

      // Update game state
      updateGameState();

      // Emit game state to all clients
      io.emit("gameState", gameState);

   }, 1000);
}

// Start the game loop
startGameLoop();
