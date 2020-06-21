// imports
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require("socket.io")


// Setup app and server
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// set up static path
app.use(express.static(publicDirectoryPath))




// startup server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})