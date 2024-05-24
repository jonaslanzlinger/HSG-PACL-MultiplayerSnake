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
  SNAKE_SPAWN_LENGTH: 3, // default length of the snake when it spawns
  SNAKE_SPAWN_DIRECTION: "d", //default direction the snake moves when it spawns
  SNAKE_SPAWN_INVULNERABILITY_MS: 2000,
  FIELDS: {
    APPLE: {
      IDENTIFIER: "a",
      INITIAL_SPAWN_AMOUNT: 10,
      SPAWN_CHANCE_PER_SECOND: 0.2,
      MAX_ON_MAP: 20,
    },
    OBSTACLE: {
      IDENTIFIER: "o",
      INITIAL_SPAWN_AMOUNT: 30, //the number of fields to be initially generated on the map
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
      EFFECT: {
        SNAKE_INVULNERABILITY_MS: 3000,
      },
    },
    INVERSER: {
      IDENTIFIER: "pi",
      SPAWN_CHANCE_PER_SECOND: 0.1,
      MAX_ON_MAP: 3,
      EFFECT: {
        INVERSE_OTHER_PLAYERS_MOVEMENT_MS: 5000,
      },
    },
    SNAKE_EATER: {
      IDENTIFIER: "pe",
      SPAWN_CHANCE_PER_SECOND: 0.1,
      MAX_ON_MAP: 3,
      EFFECT: {
        SNAKE_EATS_SNAKE_MS: 5000,
      },
    },
  },
};

module.exports = BackendConfig;
