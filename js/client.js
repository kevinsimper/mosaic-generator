document.addEventListener('change', (e) => {
  let file = e.target.files[0]
  let canvas = document.createElement('canvas')
  let content = canvas.getContext('2d')
  let image = document.createElement('img')
  image.onload = () => {
    console.log(image.width, image.height)
    document.body.appendChild(image)
  }
  let reader = new FileReader()
  reader.onload = () => {
    image.src = reader.result
  }
  reader.readAsDataURL(file)
})
