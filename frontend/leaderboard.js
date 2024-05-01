// Update leaderboard
function updateLeaderboard(map) {

   let allPlayersBodies = [];

   for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
         // check if element is numeric
         if (typeof map[y][x] === "number" && map[y][x] > 0) {
            allPlayersBodies.push(map[y][x]);
         }
      }
   }

   let leaderboard = allPlayersBodies.reduce((acc, player) => {
      if (!acc[player]) {
         acc[player] = 1;
      } else {
         acc[player] += 1;
      }
      return acc;
   }, {});

   let leaderboardList = document.getElementById("leaderboard-list");

   // remove all children of leaderboard div
   while (leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.firstChild);
   }

   // add new children to leaderboard div
   for (let player in leaderboard) {
      let playerElement = document.createElement("p");
      // add one to the final score for the head of the snake
      playerElement.innerHTML = `Player ${player}: ${leaderboard[player] + 1}`;
      leaderboardList.appendChild(playerElement);
   }
}