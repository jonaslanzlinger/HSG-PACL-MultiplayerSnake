class Tooling {
  visible = false
  
  /**
   * Add listeners to interact with tooling
   */
  static addListeners() {
    document.addEventListener("keyup", (e) => {
      // If Shift+T is pressed, toggle tooling
      if (e.key === 'T') {
        if (Tooling.visible) {
          ColorCustomizer.destroy()
          Tooling.visible = false
        } else {
          ColorCustomizer.render(snakeColors)
          Tooling.visible = true
        }
        
      }
    })

    console.log("Shift+T to toggle tooling")
  }
}  

class ColorCustomizer {

  /**
   * Render the color customizer for given color pairs
   * @param {string[][]]} colorPairs 
   */
  static render(colorPairs) {
    // Create container
    const container = document.createElement('div')
    container.id = 'color-customizer'
    
    // Create colors container
    const colors = document.createElement('div')
    colors.classList.add('colors')
    container.appendChild(colors)
    
    // Render color pairs
    colorPairs.forEach((colorPair) => {
      const pair = ColorCustomizer.renderColorPair(colorPair)
      colors.appendChild(pair)
    })
    
    // Create buttons
    const buttons = ColorCustomizer.renderButtons()
    container.appendChild(buttons)
    
    // Add container to body
    document.body.appendChild(container)
  }
  
  /**
   * Render a color pair and return the element
   * @param {string[2]} colorPair 
   * @returns 
   */
  static renderColorPair(colorPair) {
    // Create the color input for the body color
    const bodyInput = document.createElement('input')
    bodyInput.type = 'color'
    bodyInput.value = colorPair[1]
    bodyInput.classList.add('body')
    
    // Create the color input for the head color
    const headInput = document.createElement('input')
    headInput.type = 'color'
    headInput.value = colorPair[0]
    headInput.classList.add('head')
    
    // Create the color pair container
    const pair = document.createElement('div')
    pair.classList.add('color-pair')
    
    // Add the color inputs to the container
    pair.appendChild(bodyInput)
    pair.appendChild(headInput)
    
    return pair
  }
  
  /**
   * Render the buttons
   * @returns 
   */
  static renderButtons() {
    // Create button to add new color pair
    const addButton = document.createElement('button')
    addButton.innerText = 'Add'
    addButton.addEventListener('click', () => {
      const pair = ColorCustomizer.renderColorPair(['#cccccc', '#cccccc'])
      document.querySelector("#color-customizer .colors").appendChild(pair)
    })
    
    // Create button to export colors to console
    const exportButton = document.createElement('button')
    exportButton.innerText = 'Export'
    exportButton.addEventListener('click', () => {
      const colors = []
      
      // Get all color pair containers, get the inputs for the corresponding colors
      // and add them to an array
      document.querySelectorAll('#color-customizer .color-pair').forEach((colorPair) => {
        const bodyInput = colorPair.querySelector('.body')
        const headInput = colorPair.querySelector('.head')
        colors.push([headInput.value, bodyInput.value])
      })
      
      // Log the array to the console
      console.log(JSON.stringify(colors))
    })
    
    // Create button group
    const buttonGroup = document.createElement('div')
    buttonGroup.classList.add('buttons')
    
    // Add buttons to button group
    buttonGroup.appendChild(addButton)
    buttonGroup.appendChild(exportButton)
    
    return buttonGroup
  }
  
  /**
   * Destroy/remove the color customizer
   */
  static destroy() {
    document.getElementById('color-customizer').remove()
  }
}

// Add listener for when document is loaded
document.addEventListener("DOMContentLoaded", Tooling.addListeners)