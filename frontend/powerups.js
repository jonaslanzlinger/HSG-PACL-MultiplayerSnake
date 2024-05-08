const PowerupStarImage = document.createElement("img");
PowerupStarImage.src = "/assets/star.svg";
const PowerupInverserImage = document.createElement("img");
PowerupInverserImage.src = "/assets/inverser.svg";
const PowerupEaterImage = document.createElement("img");
PowerupEaterImage.src = "/assets/snake_eater.svg";
// Update powerups
function updatePowerups(player) {
  let powerupsList = document.getElementById("powerups-list");

  // remove all children of powerups div
  while (powerupsList.firstChild) {
    powerupsList.removeChild(powerupsList.firstChild);
  }

  // Add empty divs to display the powerups
  let stars = 0;
  let StarDiv = document.createElement("div");
  let StarCount = document.createElement("p");
  StarCount.textContent = stars;
  StarDiv.appendChild(StarCount);
  StarDiv.appendChild(PowerupStarImage);

  let inversers = 0;
  let InverserDiv = document.createElement("div");
  let InverserCount = document.createElement("p");
  InverserCount.textContent = inversers;
  InverserDiv.appendChild(InverserCount);
  InverserDiv.appendChild(PowerupInverserImage);

  let eaters = 0;
  let EaterDiv = document.createElement("div");
  let EaterCount = document.createElement("p");
  EaterCount.textContent = eaters;
  EaterDiv.appendChild(EaterCount);
  EaterDiv.appendChild(PowerupEaterImage);

  // If player has powerups, add them to the list
  player.powerUpInventory.forEach((powerUp) => {
    switch (powerUp) {
      case "ps":
        stars++;
        StarCount.textContent = stars;
        powerupsList.appendChild(StarDiv);
        break;
      case "pi":
        inversers++;
        InverserCount.textContent = inversers;
        powerupsList.appendChild(InverserDiv);
        break;
      case "pe":
        eaters++;
        EaterCount.textContent = eaters;
        powerupsList.appendChild(EaterDiv);
        break;
      default:
        break;
    }
  });
}
