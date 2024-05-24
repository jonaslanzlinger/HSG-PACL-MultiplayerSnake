/**
 * Updates the leaderboard with the current gamestate
 * 
 * @param {Object} gameState - The current gamestate
 */
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

      const colors = snakeColors[(player.playerNumber - 1) % snakeColors.length];

      const name = document.createElement("span")
      name.classList.add("name")
      name.style.backgroundColor = colors[1]
      name.style.color = colors[2]
      name.innerText = player.nickname

      const score = document.createElement("span")
      score.classList.add("score")
      score.style.backgroundColor = colors[0]
      score.style.color = colors[2]
      score.innerText = player.score

      playerElement.appendChild(name)
      playerElement.appendChild(score)

      leaderboardList.appendChild(playerElement);
   });
}