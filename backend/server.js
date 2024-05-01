const Player = require("./Player.js");
const Apple = require("./fields/Apple");
const Empty = require("./fields/Empty");
const Obstacle = require("./fields/Obstacle");

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
      player = new Player(socket, nickname, nextPlayerNumber, gameState.map);
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
const FPS = 10;
let players = [];

// State of the game map
const mapSize = 60;

// The amount of a given field to have on the map at any point in time
const NumberOfFields = {
    APPLE: 20,
    OBSTACLE: 30,
}

// initialize an empty map
const EMPTY_MAP = new Array(mapSize).fill(Empty.IDENTIFIER).map(() => new Array(mapSize).fill(Empty.IDENTIFIER));

// Complete game state
let gameState = {
    // initialize the map as a deep copy of the empty map template
    map: EMPTY_MAP.map(row => [...row]),
};

// Update game state
function updateGameState() {
    // re-initialize clean map to be drawn on as a deep copy from the empty map template
    let map = EMPTY_MAP.map(row => [...row]);

    drawObstacles(map);
    drawApples(map);

    // Update player positions
    players.forEach((player) => {
        let moveSuccess = player.move();
        if (!moveSuccess) {
            // Remove player from list if collided
            //TODO: better handle when player has game over
            players = players.filter((p) => p !== player);
        } else {
            drawSnake(map, player);
        }
    });

    // Update game state
    gameState.map = map;
}

function drawObstacles(map) {
    Obstacle.obstacles.forEach((o) => {
        map[o.x][o.y] = Obstacle.IDENTIFIER;
    })
}

function drawApples(map) {
    Apple.apples.forEach((a) => {
        map[a.x][a.y] = Apple.IDENTIFIER;
    })
}

function drawSnake(map, player) {
    //the snake body is denoted as the playerNumber (e.g. 2)
    player.snake.forEach((s) => {
        map[s.x][s.y] = player.playerNumber;
    });
    //the snake head is denoted as the negative playerNumber (e.g. -2)
    map[player.snake[0].x][player.snake[0].y] = -player.playerNumber;
}

// Game loop
function startGameLoop() {
    // For the initial game setup, add obstacles and apples
    Obstacle.generateObstacles(gameState.map, NumberOfFields.OBSTACLE);
    Apple.generateApples(gameState.map, NumberOfFields.APPLE);
    //TODO: currently, we always have 20 apples. Alternatively, add ticker that generates new apple every X seconds.

    setInterval(() => {
        // Update game state
        updateGameState();

        // Emit game state to all clients
        io.emit("gameState", gameState);
    }, 1000 / FPS);
}

// Start the game loop
startGameLoop();
