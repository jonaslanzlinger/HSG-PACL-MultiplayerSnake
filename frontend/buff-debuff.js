const BuffStarImage = document.createElement("img");
BuffStarImage.src = "/assets/star.svg";
const BuffInverserImage = document.createElement("img");
BuffInverserImage.src = "/assets/inverser.svg";
const BuffEaterImage = document.createElement("img");
BuffEaterImage.src = "/assets/snake_eater.svg";

var buffList = document.getElementById("buff-list");
var debuffList = document.getElementById("debuff-list");

/**
 * Updates the buff and debuff list for the player
 * 
 * @param {Player} player the player to update the buffs and debuffs for
 * @returns {void}
 */
function updateBuffs(player) {

  // remove all children of powerups div
  while (buffList.firstChild) {
    buffList.removeChild(buffList.firstChild);
  }

  // player.activePowerUps is an array of strings
  // check if "ps" is in the array
  if (player.activePowerUps.includes("ps")) {
    buffList.appendChild(BuffStarImage);
  }
  if (player.activePowerUps.includes("pi")) {
    buffList.appendChild(BuffInverserImage);
  }
  if (player.activePowerUps.includes("pe")) {
    buffList.appendChild(BuffEaterImage);
  }
}

/**
 * Updates the debuff list for the player
 * 
 * @param {Player} player the player to update the debuffs for
 * @returns {void}
 */
function updateDebuffs(player) {

  // remove all children of powerups div
  while (debuffList.firstChild) {
    debuffList.removeChild(debuffList.firstChild);
  }

  if (player.activeDebuffs.includes("pi")) {
    debuffList.appendChild(BuffInverserImage);
  }
}
