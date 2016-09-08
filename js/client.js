document.addEventListener('change', (e) => {
  let file = e.target.files[0]
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let image = document.createElement('img')
  image.onload = () => {
    let { width, height } = image
    canvas.height = height
    canvas.width = width
    context.drawImage(image, 0, 0)
    document.body.appendChild(canvas)
  }
  let reader = new FileReader()
  reader.onload = () => {
    image.src = reader.result
  }
  reader.readAsDataURL(file)
})
