const Game = require("./app/Game.js");
const SocketConfig = require("../configs/socketConfig.js");

const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();

// Create server on port 1337
const server = app.listen(SocketConfig.PORT, () => {
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
io.on(SocketConfig.EVENTS.CONNECTION, (socket) => {
   console.log("User: " + socket.id + " connected");
   let player = null;

   // Listen for joinGame event
   socket.on(SocketConfig.EVENTS.JOIN_GAME, (nickname) => {
      console.log("Player " + nickname + " joined the game");
      player = game.handlePlayerJoinedGame(socket, nickname)
   });

   // Listen for user input
   socket.on(SocketConfig.EVENTS.USER_INPUT, (userInput) => {
      player.setDirection(userInput);
   });

   // Remove player from players array when disconnected
   socket.on(SocketConfig.EVENTS.DISCONNECT, () => {
      console.log("User: " + socket.id + " disconnected");
      game.handlePlayerDisconnected(socket);
   });
});

// Start the game loop
const game = new Game(io);
game.startGameLoop();