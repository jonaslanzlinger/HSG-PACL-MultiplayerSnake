// Update leaderboard
function updateLeaderboard(gameState) {

   let leaderboardList = document.getElementById("leaderboard-list");

   // remove all children of leaderboard div
   while (leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.firstChild);
   }

   // iterate through all players and add them to the leaderboard
   gameState.players.forEach((player) => {
      let playerElement = document.createElement("p");
      playerElement.innerHTML = `${player.nickname}: ${player.score}`;
      leaderboardList.appendChild(playerElement);
   });
}