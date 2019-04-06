const socket = io()

socket.on('message', (message) => {
  console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault()

  const message = e.target.elements.message.value //"message" = name of the input from HTML

  socket.emit('sendMessage', message, (error) => {
    if (error) {
      return console.log(error)
    }

    console.log('Message delivered!')
  })
})

//Optional Feature: Sharing GEO location

document.querySelector('#send-location').addEventListener('click', () => {
  if (!navigator.geolocaion){
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  })
})

//Optional Feature: Sharing GEO location
