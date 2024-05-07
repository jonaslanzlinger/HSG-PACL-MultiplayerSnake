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
  StarDiv.appendChild(StarImage);

  let inversers = 0;
  let InverserDiv = document.createElement("div");
  let InverserCount = document.createElement("p");
  InverserCount.textContent = inversers;
  InverserDiv.appendChild(InverserCount);
  InverserDiv.appendChild(InverserImage);

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
      default:
        break;
    }
  });
}
