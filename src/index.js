//npm install nodemon --save-dev
//npm install socket.io --save
//npm install bad-words


const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) //Refactoring?
const io = socketio(server)

const port = 8080
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
  console.log('New WebSocket Connected')

  socket.on('join', ({ username,room }, callback) => {

    const { error, user } = addUser({ id: socket.id, username, room })

    if (error) {
      return callback(error)
    }

    //Join a specific room
    socket.join(user.room)

    //This emits a message only to the new use
    socket.emit('message', generateMessage('System', 'Welcome! ' +user.username))

    //This emits to everyone in the room except the the particular socket
    socket.broadcast.to(user.room).emit('message', generateMessage('System', user.username + ' has joined!'))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {

    const user = getUser(socket.id)

    //Optional Feature: Profanity Filter
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }
    //Optional Feature: Profanity Filter

    io.to(user.room).emit('message', generateMessage(user.username, message)) //This emits messages to everyone
    callback()
  })

  //Optional Feature: Sharing GEO location
  socket.on('sendLocation', (coords) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, 'https://google.com/maps?q='+coords.latitude+','+coords.longitude))
  })
  //Optional Feature: Sharing GEO location

  socket.on('disconnect', () => {

    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('System', user.username +' has left the chat room!'))

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log('Server is running on port ' +port)
})
