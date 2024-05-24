# Multiplayer Snake Game

[Play Online](https://snake.marcokaufmann.ch/)

## Overview
This is a multiplayer version of the classic Snake game, enhanced with various powerups to make the gameplay more dynamic and competitive. Players navigate their snakes on the map, eat apples to grow, and collect powerups that grant temporary abilities. The game is built using Socket.IO for real-time communication between the frontend and backend.

## Features
- **Real-time Multiplayer**: Multiple players can join and play simultaneously.
- **Classic Gameplay**: Navigate your snake to eat apples and grow longer.
- **Sound Effects**: Various sounds are implemented to increase the game feeling.
- **Dynamic Map View**: Players see only a part of the large map in a window. As the player moves, the window follows the player's snake until reaching the edge of the map.
- **Powerups**: Collect various powerups to gain temporary advantages.
## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **Communication**: Socket.IO for real-time updates between the server and clients

## Getting Started

### Prerequisites
- Node.js installed on your machine
- npm (Node package manager)

### How To Run

#### Using Node.js
1. Navigate to /backend
2. Execute the following command
```
npm install
npm run start
```
3. Visit 
```
http:localhost:1337
```

#### Using Docker
1. Build docker image
```sh
# Build yourself
docker build -t snake .

# Use prebuilt image from docker hub
docker pull mahgoh/snake
```

2. Run docker image
```sh
# Own build
docker run -p 1337:1337 snake

# Prebuilt
docker run -p 1337:1337 mahgoh/snake
```

## Gameplay Instructions
1. **Joining the Game**: Open the game in your browser and enter a username to join.
2. **Navigating Your Snake**: Use the arrow keys or WASD to navigate your snake on the map.
3. **Eating Apples**: Guide your snake to eat apples scattered on the map to grow longer.
4. **Collecting Powerups**: Move your snake over the powerups to collect them and gain temporary abilities.

## Powerups Details
- **Star (Invulnerability)**:
  - Duration: 5 seconds
  - Effect: Your snake becomes immune to collisions with other snakes and obstacles.
- **Inverser**:
  - Duration: 5 seconds
  - Effect: All other players' controls are inverted (left becomes right, up becomes down, etc.).
- **Snake Eater**:
  - Duration: 5 seconds
  - Effect: Your snake can eat other snakes, causing them to be eliminated from the game.

## Communication
The game uses Socket.IO to handle real-time communication between the frontend and backend. Events such as player movements, apple consumption, and powerup collection are transmitted instantly to ensure a smooth and responsive multiplayer experience.

---

Enjoy the game and may the best snake win!
