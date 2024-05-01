const Player = require("./Player.js");
const Apple = require("./fields/Apple");
const Empty = require("./fields/Empty");
const Obstacle = require("./fields/Obstacle");
const addRandomFieldsToMap = require("./utils/addRandomFieldsToMap");

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
      player = new Player(socket, nickname, nextPlayerNumber, map);
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

// Initial static map layout with obstacles
const initialMap = initiallyRenderMapLayout();

// make a deep copy for live use with players and other elements
let map = initialMap.map(row => [...row]);

// Complete game state
let gameState = {
    map: map,
};

/**
 * Renders an initial map to be played on including obstacles.
 * We do not want to re-generate this part every time as it's static.
 *
 * @returns {any[][]}
 */
function initiallyRenderMapLayout() {
    // Initialize empty map
    let map = new Array(mapSize).fill(Empty.IDENTIFIER).map(() => new Array(mapSize).fill(Empty.IDENTIFIER));

    // Randomly add obstacles to map based on defined NumberOfFields.OBSTACLE.
    addRandomFieldsToMap(map, Obstacle.IDENTIFIER, NumberOfFields.OBSTACLE);

    // Randomly add apples to map based on defined NumberOfFields.APPLE.
    //TODO: move away from this function
    addRandomFieldsToMap(map, Apple.IDENTIFIER, NumberOfFields.APPLE);

    return map;
}

// Update game state
function updateGameState() {
    // re-initialize map as a deep copy from the initially generated map layout (with obstacles)
    let newMap = initialMap.map(row => [...row]);

    // Update player positions
    players.forEach((player) => {
        let moveSuccess = player.move();
        if (!moveSuccess) {
            // Remove player from list if collided
            //TODO: better handle when player has game over
            players = players.filter((p) => p !== player);
        } else {
            drawSnake(newMap, player);
        }
    });

    // Update game state
    gameState.map = newMap;
}

function drawSnake(newMap, player) {
    //the snake body is denoted as the playerNumber (e.g. 2)
    player.snake.forEach((s) => {
        newMap[s.x][s.y] = player.playerNumber;
    });
    //the snake head is denoted as the negative playerNumber (e.g. -2)
    newMap[player.snake[0].x][player.snake[0].y] = -player.playerNumber;
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

// Start the game loop
startGameLoop();
