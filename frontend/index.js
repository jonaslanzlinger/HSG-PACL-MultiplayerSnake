// We can pass an optional URL argument to specify the socket server. Now, we take the default.
const socket = io();

// Send user input
function sendUserInput() {
   console.log("Doing stuff");
   const userInput = {
      direction: "someDirection"
   }
   socket.emit("userInput", userInput);
}

// Listen for game state updates
socket.on("gameState", (gameState) => {
   console.log(gameState);
});