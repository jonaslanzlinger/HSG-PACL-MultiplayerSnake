"use strict";

const BackendConfig = {
  USER_INPUTS: {
    LEFT: "a",
    UP: "w",
    RIGHT: "d",
    DOWN: "s",
    POWER_UP: "p",
  },
  FPS: 8,
  MAP_SIZE: 50,
  SNAKE_SPAWN_LENGTH: 3,
  SNAKE_SPAWN_DIRECTION: "d",
  SNAKE_SPAWN_INVULNERABILITY_MS: 2000,
  FIELDS: {
    APPLE: {
      IDENTIFIER: "a",
      INITIAL_SPAWN_AMOUNT: 20,
      SPAWN_CHANCE_PER_SECOND: 1.5,
      MAX_ON_MAP: 30,
    },
    OBSTACLE: {
      IDENTIFIER: "o",
      INITIAL_SPAWN_AMOUNT: 30,
    },
    EMPTY: {
      IDENTIFIER: 0,
    },
  },
  POWERUPS: {
    STAR: {
      IDENTIFIER: "ps",
      SPAWN_CHANCE_PER_SECOND: 0.1,
      MAX_ON_MAP: 3,
      DURATION: 5000,
    },
    INVERSER: {
      IDENTIFIER: "pi",
      SPAWN_CHANCE_PER_SECOND: 0.1,
      MAX_ON_MAP: 3,
      DURATION: 5000,
    },
    SNAKE_EATER: {
      IDENTIFIER: "pe",
      SPAWN_CHANCE_PER_SECOND: 0.1,
      MAX_ON_MAP: 3,
      DURATION: 5000,
    },
  },
};

module.exports = BackendConfig;
