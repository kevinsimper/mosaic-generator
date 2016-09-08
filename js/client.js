document.addEventListener('change', (e) => {
  let file = e.target.files[0]
  getImageDetails(file, (image) => {
    let { width, height } = image
    document.body.appendChild(image)
    let context = createCanvasContext(width, height)
    context.drawImage(image, 0, 0)
    let { gridWidth, gridHeight} = calculateGrid(width, height)
    console.log(gridWidth, gridHeight)
    generateMosaic(context, gridWidth, gridHeight)
  })
})

function generateMosaic(context, gridWidth, gridHeight) {
  let rowsLoading = []
  for(let y = 0; y < gridHeight; y++) {
    let div = document.createElement('div')
    div.style.display = 'none'
    let images = []
    for(let x = 0; x < gridWidth; x++) {
      let data = context.getImageData(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT).data
      let block = generateBlock(data)
      images.push(imageLoadedPromise(block))
      div.appendChild(block)
    }
    document.body.appendChild(div)
    rowsLoading.push(Promise.all(images).then(function () {
      return [div, y]
    }))
  }
  // run the promise one at a time left to right
  rowsLoading.reduce((previous, currentValue) => {
    // wait for the previous to finish
    return previous.then(() => {
      // then wait for the current one
      return currentValue.then((result) => {
        rowLoaded(result[0], result[1])
      })
    })
  }, Promise.resolve())
}

function rowLoaded (div, y) {
  console.log(y)
  div.style.display = ''
}

function imageLoadedPromise (image) {
  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve()
    }
  })
}

function getImageDetails (file, callback) {
  let image = document.createElement('img')
  image.onload = function () {
    return callback.bind(this, image)
  }();
  let reader = new FileReader()
  reader.onload = () => {
    image.src = reader.result
  }
  reader.readAsDataURL(file)
}

function createCanvasContext (width, height) {
  let canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d')
}

function convertToHex (r, g, b) {
  const _r = ('0' + r.toString(16)).slice(-2)
  const _g = ('0' + g.toString(16)).slice(-2)
  const _b = ('0' + b.toString(16)).slice(-2)
  return _r + _g + _b
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
  for(let i = 0; i < data.length; i += 4) {
    r = r + (data[i] * data[i])
    g = g + (data[i + 1] * data[i + 1])
    b = b + (data[i + 2] * data[i + 2])
  }
  let pixels = data.length / 4
  r = Math.floor(Math.sqrt(r / pixels))
  g = Math.floor(Math.sqrt(g / pixels))
  b = Math.floor(Math.sqrt(b / pixels))
  return [r, g, b]
}

function calculateGrid (imageWidth, imageHeight) {
  return {
    gridWidth: Math.ceil(imageWidth / TILE_WIDTH),
    gridHeight: Math.ceil(imageHeight / TILE_HEIGHT)
  }
}

function generateBlock (data) {
  let rgbArray = calculateAverageColor(data)
  const hex = convertToHex(...rgbArray)
  return createColorBlock(hex)
}
