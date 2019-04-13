const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    message
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value //"message" = name of the input from HTML

  socket.emit('sendMessage', message, (error) => {

    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''   //Clear the message box after clicking the 'Send' button
    $messageFormInput.focus()      //Brings the Cursor back to the message box after sending a message

    if (error) {
      return console.log(error)
    }

    console.log('Message delivered!')
  })
})

//Optional Feature: Sharing GEO location

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocaion){
    return alert('Geolocation is not supported by your browser.')
  }

  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $sendLocationButton.removeAttribute('disabled')
      console.log('Location shared!')
    })
  })
})

//Optional Feature: Sharing GEO location
