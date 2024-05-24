const Game = require("./app/Game.js");
const SocketConfig = require("./configs/socketConfig.js");
const BackendConfig = require("./configs/backendConfig.js");
const Chat = require("./app/Chat.js");

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

// Instantiate Chat Log
const chat = new Chat();

// Listen socket.io events
io.on(SocketConfig.EVENTS.CONNECTION, (socket) => {
  console.log("User: " + socket.id + " connected");
  let player = null;

  // Listen for joinGame event
  socket.on(SocketConfig.EVENTS.JOIN_GAME, (nickname) => {
    console.log("Player " + nickname + " joined the game");
    player = game.handlePlayerJoinedGame(socket, nickname);
    socket.emit(SocketConfig.EVENTS.PLAYER_NUMBER, player.playerNumber);
    socket.emit(SocketConfig.EVENTS.CHAT_TO_FRONTENT, chat.getMessages());
  });

  // Listen for user input
  socket.on(SocketConfig.EVENTS.USER_INPUT, (userInput) => {
    if (
      userInput === BackendConfig.POWERUPS.STAR.IDENTIFIER ||
      userInput === BackendConfig.POWERUPS.INVERSER.IDENTIFIER ||
      userInput === BackendConfig.POWERUPS.SNAKE_EATER.IDENTIFIER
    ) {
      player.usePowerUp(userInput);
    } else {
      player.setDirection(userInput);
    }
  });

  // Remove player from players array when disconnected
  socket.on(SocketConfig.EVENTS.DISCONNECT, () => {
    game.handlePlayerDisconnected(socket);
  });

  // Remove player from players array when game over
  socket.on(SocketConfig.EVENTS.FORCE_DISCONNECT, () => {
    socket.disconnect();
  });

  // Listen for chat messages
  socket.on(SocketConfig.EVENTS.CHAT, (message) => {
    chat.addMessage(message, player.nickname);
    socket.emit(SocketConfig.EVENTS.CHAT_TO_FRONTENT, chat.getMessages());
  });
});

// Start the game loop
const game = new Game(io);
game.startGameLoop();