'use strict';

const BackendConfig = {
    USER_INPUTS: {
        LEFT: 'a',
        UP: 'w',
        RIGHT: 'd',
        DOWN: 's',
        POWER_UP: 'p',
    },
    FPS: 8,
    MAP_SIZE: 50,
    SNAKE_SPAWN_LENGTH: 3, // default length of the snake when it spawns
    SNAKE_SPAWN_DIRECTION: 'd', //default direction the snake moves when it spawns
    SNAKE_SPAWN_INVULNERABILITY_MS: 2000,
    FIELDS: {
        APPLE: {
            IDENTIFIER: 'a',
            NUMBER_OF_FIELDS: 20,
        },
        OBSTACLE: {
            IDENTIFIER: 'o',
            NUMBER_OF_FIELDS: 30, //the number of fields to be generated on the map
        },
        EMPTY: {
            IDENTIFIER: 0,
        },
    },
    POWERUPS: {
        STAR: {
            IDENTIFIER: 'ps',
            //SPAWN_CHANCE: 0.1, //TODO: handle spawn chances of different power ups
            EFFECT: {
                SNAKE_INVULNERABILITY_MS: 3000,
            }
        }
    }
}

module.exports = BackendConfig;