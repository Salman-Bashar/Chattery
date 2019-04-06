const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app) //Refactoring?
const io = socketio(server)

const port = 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
  console.log('New WebSocket Connected')

  socket.emit('message', 'Welcome!') //This emits only to the new user

  socket.broadcast.emit('message', 'A new user has joined!') //This emits to everyone except the the particular socket

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.emit('message', message) //This emits to everyone
    callback()
  })

  //Optional Feature: Sharing GEO location
  socket.on('sendLocation', (coords) => {
    io.emit('message', 'https://google.com/maps?q='+coords.latitude+','+coords.longitude)
  })
  //Optional Feature: Sharing GEO location

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!')
  })
})

server.listen(port, () => {
  console.log('Server is running on port ' +port)
})
