let socket = null
let prevGameState = null
let camera = null
let gameAudio = null

// Constants
const TILE_SIZE = 28
const cameraWidth = 40
const cameraHeight = 24
const cameraThreshold = 7

// Initialize images for drawing
// Only need to load once
const AppleImage = new Image()
const StarImage = new Image()
const InverserImage = new Image()
const ObstacleImage = new Image()
const ShieldImage = new Image()
AppleImage.src = '/assets/apple.svg'
StarImage.src = '/assets/star.svg'
InverserImage.src = '/assets/inverser.svg'
ObstacleImage.src = '/assets/obstacle.svg'
ShieldImage.src = '/assets/shield.svg'

const snakeColors = [
  ['#0000ff', '#7a7aff'],
  ['#ff0000', '#ff7a7a'],
  ['#ffd700', '#fbe87e'],
  ['#9ae91c', '#c7fb74'],
  ['#1cf29c', '#85ffce'],
  ['#9b30f2', '#c583fb'],
  ['#322f36', '#68666b'],
  ['#00bfff', '#8fe3ff'],
  ['#f2991c', '#ffc370'],
  ['#ff338b', '#ff7ab4'],
  ['#196b1b', '#59915a'],
  ['#232277', '#56558b'],
  ['#806452', '#bea293'],
  ['#800080', '#c665c8'],
  ['#a7320c', '#db7c5c'],
]

// Initialize audio
gameAudio = new GameAudio()

function startGame() {
  document.getElementById('login').style.display = 'none'
  document.getElementById('final-score-value').style.display = 'block'
  document.getElementById('game').style.display = 'block'
  let nickname = document.getElementById('nickname').value

  initSocket(nickname)
  initKeyControls()
  initMap()
  gameAudio.playMusic()
}

/**
 * Sets the background color of the canvas and draws a grid.
 *
 * @param {string} color1 - The color to fill the canvas.
 * @param {string} color2 - The color of the grid lines.
 * @return {void} This function does not return a value.
 */
function setBackground(color1, color2) {
  ctx.fillStyle = color1
  ctx.strokeStyle = color2
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (var x = 0.5; x < canvas.width; x += TILE_SIZE) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
  }
  for (var y = 0.5; y < canvas.height; y += TILE_SIZE) {
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
  }
  ctx.stroke()
}

// Init socket
function initSocket(nickname) {
  socket = io()

  socket.emit('joinGame', nickname)

  // Lister for player number
  socket.on('playerNumber', (playerNumber) => {
    this.playerNumber = playerNumber
  })

  // Listen for game state updates
  socket.on('gameState', (gameState) => {
    // If player is dead, return to login screen
    if (gameState.players.find((player) => player.playerNumber === this.playerNumber).gameOver) {
      gameAudio.stopMusic()

      document.getElementById('login').style.display = 'block'
      document.getElementById('game').style.display = 'none'
      document.getElementById('final-score-value').innerText = `Final Score: ${
        gameState.players.find((player) => player.playerNumber === this.playerNumber).score
      }`

      // Reset camera
      camera = null
      // Reset background
      setBackground('#fff', '#ccc')

      socket.emit('forceDisconnect')
      return
    }

    updateLeaderboard(gameState)

    //TODO: add field which shows powerups in inventory (picked up)
    //TODO: add field which shows currently active powerup? -> also show timer that decreases on frontend! Example: See INVERSE_OTHER_PLAYERS_MOVEMENT_MS that defines how lung the debuff is active
    //TODO: handle all powerUp states -> See Player.activePowerUp and Player.activeDebuffs
    //TODO: mark visually when player has a debuff (e.g. Inverser makes movement inverse for player)
    //TODO: add visuals for spawnInvulnerability (currently same visual as for Star.js -> see Player.snakeInvulnerability)

    //TODO: probably much more. For hints, check all todos in backend and what is sent to frontend in Player.getPlayerGameState

    let canvas = document.getElementById('canvas')
    canvas.height = TILE_SIZE * cameraHeight + 1
    canvas.width = TILE_SIZE * cameraWidth + 1
    ctx.beginPath()
    setBackground('#fff', '#ccc')

    if (!this.playerNumber) {
      return
    }

    if (!camera) {
      // Init camera
      camera = new Camera(
        gameState.map,
        this.playerNumber,
        cameraWidth,
        cameraHeight,
        cameraThreshold
      )
    } else {
      // Update camera with new map state, i.e. move camera if needed
      camera.update(gameState.map)
    }

    let player = gameState.players.find((p) => p.playerNumber === this.playerNumber)

    // Draw map
    for (let x = camera.x; x < camera.x + camera.width; x++) {
      for (let y = camera.y; y < camera.y + camera.height; y++) {
        if (gameState.map[x][y] !== 0) {
          switch (true) {
            //field: snake body
            case gameState.map[x][y] > 0:
              ctx.fillStyle =
                snakeColors[(gameState.map[x][y] - 1) % snakeColors.length][
                  player?.activeDebuffs.includes('pi') ? 0 : 1
                ]

              ctx.fillRect(
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              break
            //field: snake head
            case gameState.map[x][y] < 0:
              ctx.fillStyle =
                snakeColors[(gameState.map[x][y] * -1 - 1) % snakeColors.length][
                  player?.activeDebuffs.includes('pi') ? 1 : 0
                ]
              ctx.fillRect(
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              // Check if sounds should be played for my snake
              if (gameState.map[x][y] === -this.playerNumber && prevGameState !== null) {
                gameAudio.playSoundByFieldType(prevGameState[x][y])
              }

              if (player?.snakeInvulnerability) {
                ctx.drawImage(
                  ShieldImage,
                  (x - camera.x) * TILE_SIZE,
                  (y - camera.y) * TILE_SIZE,
                  TILE_SIZE,
                  TILE_SIZE
                )
              }
              break
            //field: apple
            case gameState.map[x][y] === 'a':
              ctx.drawImage(
                AppleImage,
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              break
            //field: obstacle
            case gameState.map[x][y] === 'o':
              ctx.drawImage(
                ObstacleImage,
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              break
            //powerup field: star
            //TODO: move field identifiers to common config (see configs folder -> some things are necessary for both backend and frontend (not super important))
            case gameState.map[x][y] === 'ps':
              ctx.drawImage(
                StarImage,
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              break
            //powerup field: inverser
            case gameState.map[x][y] === 'pi':
              ctx.drawImage(
                InverserImage,
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              break
            default:
              //TODO: nothing should be orange, so be careful if you see that on the map. handle better
              ctx.fillStyle = 'orange'
              ctx.fillRect(
                (x - camera.x) * TILE_SIZE,
                (y - camera.y) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              )
              break
          }
        }
      }
    }

    // Save previous game state
    prevGameState = gameState.map

    // Draw map bounds left
    if (camera.x === 0) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, canvas.height)
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // Draw map bounds right
    if (camera.x + camera.width === gameState.map.length) {
      ctx.beginPath()
      ctx.moveTo(canvas.width, 0)
      ctx.lineTo(canvas.width, canvas.height)
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // Draw map bounds top
    if (camera.y === 0) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(canvas.width, 0)
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // Draw map bounds bottom
    if (camera.y + camera.height === gameState.map[0].length) {
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      ctx.lineTo(canvas.width, canvas.height)
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 4
      ctx.stroke()
    }
  })
}

// Init key controls
function initKeyControls() {
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        sendUserInput('w')
        break
      case 'a':
      case 'ArrowLeft':
        sendUserInput('a')
        break
      case 's':
      case 'ArrowDown':
        sendUserInput('s')
        break
      case 'd':
      case 'ArrowRight':
        sendUserInput('d')
        break
      case ' ': //send powerUp (p) when spacebar is pressed
        sendUserInput('p')
        break
    }
  })
}

// Init map
function initMap() {
  let canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  canvas.setAttribute('tabindex', 1)
  canvas.style.outline = 'none'
  canvas.focus()
}

// Send user input
function sendUserInput(userInput) {
  socket.emit('userInput', userInput)
}
