const BuffStarImage = document.createElement("img");
BuffStarImage.src = "/assets/star.svg";
const BuffInverserImage = document.createElement("img");
BuffInverserImage.src = "/assets/inverser.svg";
const BuffEaterImage = document.createElement("img");
BuffEaterImage.src = "/assets/snake_eater.svg";
function updateBuffs(player) {
  let buffList = document.getElementById("buff-list");

  // remove all children of powerups div
  while (buffList.firstChild) {
    buffList.removeChild(buffList.firstChild);
  }
  switch (player.activePowerUp) {
    case "ps":
      buffList.appendChild(BuffStarImage);
      break;
    case "pi":
      buffList.appendChild(BuffInverserImage);
      break;
    case "pe":
      buffList.appendChild(BuffEaterImage);
      break;
  }
}

function updateDebuffs(player) {
  let debuffList = document.getElementById("debuff-list");

  // remove all children of powerups div
  while (debuffList.firstChild) {
    debuffList.removeChild(debuffList.firstChild);
  }

  player.activeDebuffs.forEach((debuff) => {
    switch (debuff) {
      case "ps":
        debuffList.appendChild(BuffStarImage);
        break;
      case "pi":
        debuffList.appendChild(BuffInverserImage);
        break;
      case "pe":
        debuffList.appendChild(BuffEaterImage);
    }
  });
}
