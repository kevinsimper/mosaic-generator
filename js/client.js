document.addEventListener('change', (e) => {
  let file = e.target.files[0]
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let image = document.createElement('img')
  image.onload = () => {
    let { width, height } = image
    document.body.appendChild(image)
    canvas.height = height
    canvas.width = width
    context.drawImage(image, 0, 0)
    let { gridWidth, gridHeight} = calculateGrid(width, height)
    console.log(gridWidth, gridHeight)
    for(let y = 0; y < gridHeight; y++) {
      for(let x = 0; x < gridWidth; x++) {
        let data = context.getImageData(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT).data
        generateRow(data)
      }
    }
  }
  let reader = new FileReader()
  reader.onload = () => {
    image.src = reader.result
  }
  reader.readAsDataURL(file)
})

function convertToHex (r, g, a) {
  const _r = ('0' + r.toString(16)).slice(-2)
  const _g = ('0' + g.toString(16)).slice(-2)
  const _a = ('0' + a.toString(16)).slice(-2)
  return _r + _g + _a
}

function createColorBlock (hex) {
  let block = document.createElement('img')
  block.src = '/color/' + hex
  return block
}

function calculateAverageColor (data) {
  let r = 0
  let b = 0
  let g = 0
  console.log(data)
  for(let i = 0; i < data.length; i += 4) {
    r += data[i]
    b += data[i + 1]
    g += data[i + 2]
  }
  let pixels = data.length / 4
  console.log(r, g, b, pixels)
  r = Math.floor(r / pixels)
  g = Math.floor(g / pixels)
  b = Math.floor(b / pixels)
  return [r, g, b]
}

function calculateGrid (imageWidth, imageHeight) {
  return {
    gridWidth: Math.ceil(imageWidth / TILE_WIDTH),
    gridHeight: Math.ceil(imageHeight / TILE_HEIGHT)
  }
}

function generateRow (data) {
  let rgbArray = calculateAverageColor(data)
  const hex = convertToHex(...rgbArray)
  let block = createColorBlock(hex)
  document.body.appendChild(block)
}
