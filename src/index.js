// imports
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require("socket.io")
const { addUser, removeUser, getUser, getUsersInRoom, getAllRoomData } = require('./utils/rooms')
const { generateMessage } = require('./utils/messages')

// Setup app and server
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// set up static path
app.use(express.static(publicDirectoryPath))


// socket start
io.on("connection", (socket) => {
    console.log("New user connected")
    var currentRoom; // keep room name for later use

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        currentRoom = user.room

        socket.emit("message", generateMessage(user.room, `Welcome to room ${user.room}`))
        // notify other users in room
        socket.broadcast.to(user.room).emit("message", generateMessage(user.room, `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMessage', (message, callback) => {
        // received message to send, emit
        const user = getUser({ room: currentRoom, id: socket.id })
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser({ room: currentRoom, id: socket.id })
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.room, `${user.username} has left the room.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})



// startup server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})