const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class SnakeEater {
  //p for powerup, e for eater
  static IDENTIFIER = BackendConfig.POWERUPS.SNAKE_EATER.IDENTIFIER;

  // Stores positions of eater on map
  static eaters = [];

  // Though the SPAWN_CHANCE_PER_SECOND denotes the percentage per second, the actual tick rate of the game
  // is 1000 / FPS, so we have to calculate the chance per tick.
  static SPAWN_CHANCE_PER_TICK =
    BackendConfig.POWERUPS.SNAKE_EATER.SPAWN_CHANCE_PER_SECOND /
    BackendConfig.FPS;

  constructor() {}

  /**
   * Randomly generate valid eater coordinates while reflecting the desired SPAWN_CHANCE
   *
   * @param map
   * @returns {*[]}
   */
  static generateEaters(map) {
    //Denotes the maximum number of eaters allowed on the map
    const maxEatersReached =
      this.eaters.length >= BackendConfig.POWERUPS.SNAKE_EATER.MAX_ON_MAP;

    // Only generate eater at a rate that resembles the defined SPAWN_CHANCE
    if (!maxEatersReached && Math.random() < this.SPAWN_CHANCE_PER_TICK) {
      // Generate random map field coordinates
      const x = Math.floor(Math.random() * map.length);
      const y = Math.floor(Math.random() * map[0].length);

      // Check if the field is empty
      if (map[x][y] === Empty.IDENTIFIER) {
        // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
        map[x][y] = SnakeEater.IDENTIFIER;

        // Store generated eater in eaters array
        let eater = {
          x: x,
          y: y,
        };
        this.eaters.push(eater);
      }
    }
  }

  static handleSnakeConsumedEater(map, eaterCoordinate, powerUpInventory) {
    // After consumption, the field cell is back to normal
    map[eaterCoordinate.x][eaterCoordinate.y] = Empty.IDENTIFIER;

    // Remove the eater at given coordinates from array of available eaters
    this.eaters = this.eaters.filter(function (eater) {
      return !(eater.x === eaterCoordinate.x && eater.y === eaterCoordinate.y);
    });

    // Add PowerUp to inventory of player
    powerUpInventory.push(SnakeEater.IDENTIFIER);
  }

  /**
   * Gain ability to eat other snakes until timeout is reached.
   *
   * @param player is the snake receiving the powerup.
   */
  static activatePowerUp(player) {
    player.snakeEatability = true;
    player.isPowerUpActive = true;

    setTimeout(() => {
      player.snakeEatability = false;
      player.isPowerUpActive = false;
      player.activatePowerUp = null;
    }, BackendConfig.POWERUPS.SNAKE_EATER.EFFECT.SNAKE_EATS_SNAKE_MS);
  }
}

module.exports = SnakeEater;