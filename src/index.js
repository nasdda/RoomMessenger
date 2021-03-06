// imports
const express = require('express')
const path = require('path')
const socketio = require("socket.io")
const { addUser, removeUser, getUser, getUsersInRoom, getRoomData, createRoom, getAllRoomData } = require('./utils/rooms')
const { generateMessage } = require('./utils/messages')


// Setup app and server
const app = express()
const server = require('http').createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// set up static path
app.use(express.static(publicDirectoryPath))

// socket start
io.on("connection", (socket) => {
    console.log("New user connected")
    let currentRoom // keep room name for later use

    socket.on('createRoom', (options, callback) => {
        createRoom(options).then((result) => {
            creatingStage = true
            callback()
        }).catch((e) => {
            callback(e)
        })
    })

    socket.on('validateJoin', (options, callback) => {
        if (!getRoomData(options.room)) {
            return callback()
        }
        if (getRoomData(options.room).hostName === options.username && getRoomData(options.room).userList == false) {
            // indicates current user is host
            return callback()
        }
        const hashedPassword = getRoomData(options.room).password
        // hashedPassword should be undefined if no password was set
        callback(hashedPassword)
    })

    socket.on('join', (options, callback) => {
        addUser({ id: socket.id, ...options }).then((user) => {
            currentRoom = user.room
            socket.join(user.room) // join is case sensitive. toLowerCase should NOT be called on any .to functions

            socket.emit("message", generateMessage(user.room, `Welcome to room ${user.room}`))
            // notify other users in room
            socket.broadcast.to(user.room).emit("message", generateMessage(user.room, `${user.username} has joined!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
                hostName: getRoomData(user.room).hostName
            })
            callback()
        }).catch((e) => {
            console.log(e)
            return callback(e)
        })
    })


    socket.on('sendMessage', (message, callback) => {
        // console.log(getAllRoomData())
        // received message to send, emit
        const user = getUser({ room: currentRoom, id: socket.id })
        if (!user) {
            // cant find user
            return callback()
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('kick', (selection, callback) => {
        io.to(selection.room).emit('message', generateMessage(selection.room,
            `${selection.userToKick} has been kicked out by the host.`))
        socket.broadcast.to(selection.room).emit('kicked', { userToKick: selection.userToKick })
    })

    socket.on('disconnect', () => {
        console.log("User disconnected")
        if (!currentRoom) {
            return
        }
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