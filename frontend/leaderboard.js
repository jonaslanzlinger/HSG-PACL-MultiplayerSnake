// Update leaderboard
function updateLeaderboard(gameState) {

   let leaderboardList = document.getElementById("leaderboard-list");

   // remove all children of leaderboard div
   while (leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.firstChild);
   }

   // iterate through all players and add them to the leaderboard
   gameState.players.sort((a, b) => (b.score - a.score)).forEach((player) => {
      let playerElement = document.createElement("li");
      playerElement.className = "player";

      const color = snakeColors[(player.playerNumber - 1 ) % snakeColors.length][0];
      playerElement.style.color = color;

      playerElement.innerHTML = `<span>${player.nickname}</span><span>${player.score}</span>`;
      leaderboardList.appendChild(playerElement);
   });
}