class Camera {
  #map
  #camX
  #camY
  #camWidth
  #camHeight
  #threshold

  /**
   * Creates a new camera
   * @param {number[][]} map    The map
   * @param {number} camWidth   The width of the camera 
   * @param {number} camHeight  The height of the camera
   * @param {number} threshold  The threshold for the camera to move
   */
  constructor(map, camWidth, camHeight, threshold = 5) {
    if (camWidth > map.length || camHeight > map[0].length) {
      throw new Error('Camera cannot be larger than the map')
    }

    this.#map = map
    this.#camWidth = camWidth
    this.#camHeight = camHeight
    this.#threshold = threshold

    // Calculate the initial camera position
    this.#getInitialBounds()
  }

  /**
   * Updates the camera position
   * @param {number[][]} map 
   */
  update(map) {
    this.#map = map
    // Get the player position
    const { playerX, playerY } = this.#getPlayerPosition()

    // Calculate the delta between the player and the camera
    // for each of the 4 directions
    const deltaTop = playerY - this.#camY
    const deltaRight = this.#camX + this.#camWidth - playerX
    const deltaBottom = this.#camY + this.#camHeight - playerY
    const deltaLeft = playerX - this.#camX

    // If the delta is less than the threshold
    // and the camera is not at the edge, move the camera
    if (deltaTop < this.#threshold && this.#camY > 0) {
      this.#camY--
    } else if (deltaRight < this.#threshold && this.#camX + this.#camWidth < map.length) {
      this.#camX++
    } else if (deltaBottom < this.#threshold && this.#camY + this.#camHeight < map[0].length) {
      this.#camY++
    } else if (deltaLeft < this.#threshold && this.#camX > 0) {
      this.#camX--
    }
  }

  /**
   * Gets the player position based on the map
   * @return {{playerX: number, playerY: number}}
   */
  #getPlayerPosition() {
    for (let x = 0; x < this.#map.length; x++) {
      for (let y = 0; y < this.#map[x].length; y++) {
        if (this.#map[x][y] < 0) {
          return { playerX: x, playerY: y }
        }
      }
    }
  }

  /**
   * Calculates the initial bounds of the camera
   * based on the player position. The player is
   * centered in the middle of the camera.
   */
  #getInitialBounds() {
    // Get player position
    const { playerX, playerY } = this.#getPlayerPosition()

    // Calculate camera bounds
    let camX = playerX - Math.floor(this.#camWidth / 2)
    let camY = playerY - Math.floor(this.#camHeight / 2)

    // Clamp camera bounds (top/left)
    if (camX < this.#threshold) camX = this.#threshold
    if (camY < this.#threshold) camY = this.#threshold

    // Clamp camera bounds (bottom/right)
    if (camX + this.#camWidth >= this.#map.length - this.#threshold) camX = this.#map.length - this.#camWidth - this.#threshold
    if (camY + this.#camHeight >= this.#map[0].length - this.#threshold) camY = this.#map[0].length - this.#camHeight - this.#threshold

    // Set camera bounds
    this.#camX = camX
    this.#camY = camY
  }

  // Getters
  get x() {
    return this.#camX
  }
  get y() {
    return this.#camY
  }
  get width() {
    return this.#camWidth
  }
  get height() {
    return this.#camHeight
  }
}
