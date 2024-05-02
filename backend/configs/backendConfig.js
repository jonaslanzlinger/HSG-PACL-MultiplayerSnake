'use strict';

const BackendConfig = {
    FPS: 8,
    MAP_SIZE: 50,
    SNAKE_SPAWN_LENGTH: 3, // default length of the snake when it spawns
    SNAKE_SPAWN_DIRECTION: 'd', //default direction the snake moves when it spawns
    SNAKE_SPAWN_INVULNERABILITY_MS: 2000,
    NUMBER_OF_FIELDS: { //the number of fields to be generated on the map
        APPLE: 20,
        OBSTACLE: 30,
    },
    POWERUPS: {
        STAR: {
            //SPAWN_CHANCE: 0.1, //TODO: handle spawn chances of different power ups
            EFFECT: {
                SNAKE_INVULNERABILITY_MS: 3000,
            }
        }
    }
}

module.exports = BackendConfig;