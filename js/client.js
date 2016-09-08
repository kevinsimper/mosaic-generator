class MosaicApp {
  constructor() {
    document.querySelector('#file').addEventListener('change', this.fileChange.bind(this))
    this.imageEl = document.querySelector('#image')
    this.mosaicEl = document.querySelector('#mosaic')
  }
  clearApp() {
    this.imageEl.innerHTML = ''
    this.mosaicEl.innerHTML = ''
  }
  fileChange(e) {
    this.clearApp()
    let file = e.target.files[0]
    let image = new ImageLoader(file)
    image.getDetails(file, (image) => {
      let { width, height } = image
      this.imageEl.appendChild(image)
      let context = createCanvasContext(width, height)
      context.drawImage(image, 0, 0)
      let { gridWidth, gridHeight} = this.calculateGrid(width, height)
      console.log(gridWidth, gridHeight)
      this.generate(context, gridWidth, gridHeight)
    })
  }
  generate(context, gridWidth, gridHeight) {
    let rowsLoading = []
    for(let y = 0; y < gridHeight; y++) {
      let div = this.createRow()
      let images = []
      for(let x = 0; x < gridWidth; x++) {
        let data = context.getImageData(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT).data
        let blockPromise = this.generateBlock(data).then((block) => {
          div.appendChild(block)
          return this.makeImageLoadedPromise(block)
        })
        images.push(blockPromise)
      }
      rowsLoading.push(Promise.all(images).then(function () {
        return [div, y]
      }))
    }
    this.sequentialLoad(rowsLoading)
    // run the promise one at a time left to right
  }
  createRow() {
    let div = document.createElement('div')
    div.className = 'row'
    div.style.display = 'none'
    this.mosaicEl.appendChild(div)
    return div
  }
  sequentialLoad(rows) {
    rows.reduce((previous, currentValue) => {
      // wait for the previous to finish
      return previous.then(() => {
        // then wait for the current one
        return currentValue.then((result) => {
          this.rowLoaded(result[0], result[1])
        })
      })
    }, Promise.resolve())
  }
  rowLoaded (div, y) {
    console.log(y)
    div.style.display = ''
  }
  makeImageLoadedPromise (image) {
    return new Promise((resolve, reject) => {
      image.onload = () => {
        resolve()
      }
    })
  }
  calculateGrid (imageWidth, imageHeight) {
    return {
      gridWidth: Math.ceil(imageWidth / TILE_WIDTH),
      gridHeight: Math.ceil(imageHeight / TILE_HEIGHT)
    }
  }
  generateBlock (data) {
    // let rgbArray = worker.postMessage([1, data])
    return new Promise((resolve, reject) => {
      let rgbArray = calculateAverageColor(data)
      const hex = convertToHex(...rgbArray)
      resolve(this.createColorBlock(hex))
    })
  }
  createColorBlock (hex) {
    let block = document.createElement('img')
    block.src = '/color/' + hex
    return block
  }
}
new MosaicApp()

class ImageLoader {
  constructor() {
    this.image = document.createElement('img')
  }
  getDetails (file, callback) {
    console.log(this)
    this.image.onload = function () {
      return callback.bind(this, this.image)
    }.bind(this)();
    let reader = new FileReader()
    reader.onload = () => {
      this.image.src = reader.result
    }
    reader.readAsDataURL(file)
  }
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
