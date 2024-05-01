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
const FPS = 10;
let players = [];

// State of the game map
const mapSize = 60;
// Percentage of apples on the map (number between 0 and 1)
const appleDensity = 0.01
// Percentage of obstacles when map is initially generated (number between 0 and 1)
const obstacleDensity = 0.005

// The available field types on the playing map
const FieldType = {
   EMPTY: 0,
   OBSTACLE: 'o',
   APPLE: 'a',
   //POWERUP: 'p',
};

// Initial static map layout with obstacles
const initialMap = initiallyRenderMapLayout();

// make a deep copy for live use with players and other elements
let map = initialMap.map(row => [...row]);


/**
 * Takes a map (2d array) and randomly generates fields of a given type based on the desired fieldDensity
 *
 * @param map is the playing map to generate fields on
 * @param newFieldType is the field type to be generated on the given map
 * @param fieldDensity is the percentage of how much of the map should be covered in the newFieldType
 * @returns {*}
 */
function addRandomFieldsToMap(map, newFieldType, fieldDensity) {
   //Use the total map area of length*width and defined density to calculate the necessary number of fields to be changed
   const numberOfFieldsToBeGenerated = (map.length * map[0].length) * fieldDensity;

   // Until we reach the desired field density, select a random field on the map and try to change it into the new field
   let count = 0;
   while (count < numberOfFieldsToBeGenerated) {
      // Generate random indices
      const row = Math.floor(Math.random() * map.length);
      const col = Math.floor(Math.random() * map[0].length);

      // Check if the field is empty
      if (map[row][col] === FieldType.EMPTY) {
         map[row][col] = newFieldType;
         count++;
      }
   }
   return map;
}

/**
 * Renders an initial map to be played on including obstacles.
 * We do not want to re-generate this part every time as it's static.
 *
 * @returns {any[][]}
 */
function initiallyRenderMapLayout() {
   // Initialize empty map
   let map = new Array(mapSize).fill(FieldType.EMPTY).map(() => new Array(mapSize).fill(FieldType.EMPTY));

   // Randomly add obstacles to map based on defined obstacleDensity.
   addRandomFieldsToMap(map, FieldType.OBSTACLE, obstacleDensity);
   // Randomly add apples to map based on defined appleDensity.
   //TODO: apples need to be regenerated when eaten on every tick and ensure that we always have around appleDensity on the map
   addRandomFieldsToMap(map, FieldType.APPLE, appleDensity);

   //TODO: remove
   console.log(map.toString())

   return map;
}

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
      //TODO: fix snake getting longer and longer
      map = initialMap;

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
