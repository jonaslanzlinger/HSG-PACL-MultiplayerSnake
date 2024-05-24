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
   * Render the color customizer for given color triples
   * @param {string[][]]} colorTriples
   */
  static render(colorTriples) {
    // Create container
    const container = document.createElement('div')
    container.id = 'color-customizer'
    
    // Create colors container
    const colors = document.createElement('div')
    colors.classList.add('colors')
    container.appendChild(colors)
    
    // Render color triples
    colorTriples.forEach((colorTriple) => {
      const triple = ColorCustomizer.renderColorTriple(colorTriple)
      colors.appendChild(triple)
    })
    
    // Create buttons
    const buttons = ColorCustomizer.renderButtons()
    container.appendChild(buttons)
    
    // Add container to body
    document.body.appendChild(container)
  }
  
  /**
   * Render a color triple and return the element
   * @param {string[3]} colorTriple 
   * @returns 
   */
  static renderColorTriple(colorTriple) {
    // Create the color input for the body color
    const bodyInput = document.createElement('input')
    bodyInput.type = 'color'
    bodyInput.value = colorTriple[1]
    bodyInput.classList.add('body')
    
    // Create the color input for the head color
    const headInput = document.createElement('input')
    headInput.type = 'color'
    headInput.value = colorTriple[0]
    headInput.classList.add('head')

    // Create the color input for the text color
    const textInput = document.createElement('input')
    textInput.type = 'color'
    textInput.value = colorTriple[2]
    textInput.classList.add('text')
    
    // Create the color triple container
    const triple = document.createElement('div')
    triple.classList.add('color-triple')
    
    // Add the color inputs to the container
    triple.appendChild(bodyInput)
    triple.appendChild(headInput)
    triple.appendChild(textInput)
    
    return triple
  }
  
  /**
   * Render the buttons
   * @returns 
   */
  static renderButtons() {
    // Create button to add new color triple
    const addButton = document.createElement('button')
    addButton.innerText = 'Add'
    addButton.addEventListener('click', () => {
      const triple = ColorCustomizer.renderColorTriple(['#cccccc', '#cccccc', '#111111'])
      document.querySelector("#color-customizer .colors").appendChild(triple)
    })
    
    // Create button to export colors to console
    const exportButton = document.createElement('button')
    exportButton.innerText = 'Export'
    exportButton.addEventListener('click', () => {
      const colors = []
      
      // Get all color triple containers, get the inputs for the corresponding colors
      // and add them to an array
      document.querySelectorAll('#color-customizer .color-triple').forEach((colorPair) => {
        const bodyInput = colorPair.querySelector('.body')
        const headInput = colorPair.querySelector('.head')
        const textInput = colorPair.querySelector('.text')
        colors.push([headInput.value, bodyInput.value, textInput.value])
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