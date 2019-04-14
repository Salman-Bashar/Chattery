const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Feature: Autoscroll
const autoscroll = () => {
  //New Message Element
  const $newMessage = $messages.lastElementChild

  //Height of the New Message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of Messages Container
  const containerHeight = $messages.scrollHeight

  //How Far have I Scrolled?
  const scrollOfset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOfset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')  //Timestamp of posting a message
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

//Optional Feature: Geolocation

socket.on('locationMessage', (message) => {
  console.log(url)
  const html = Mustache.render(locationMessageTemplate, {
    usrnamer: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $message.innerAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//Optional Feature: Geolocation

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


//Feature: Joining Room
socket.emit('join', { username,room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
} )
