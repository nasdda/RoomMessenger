// npm modules
const bcrypt = require('bcrypt')

const rooms = new Map()
/*
    rooms Map format:
    room name -> { userList: list, password: encrypted string, roomCap: integer }
*/

const usernameLengthLimit = 35
const roomLengthLimit = 35
const passwordLengthLimit = 50

const addUser = ({ id, username, room, password }) => {
    // remove extra spaces
    username = username.trim()
    room = room.trim()

    return new Promise((resolve, reject) => {
        // confirm data is valid
        if (!username || !room) {
            reject('Username and room are required!')
        }

        if (username.length > usernameLengthLimit) {
            reject(`Username should be within ${usernameLengthLimit} characters`)
        }

        if (room.length > roomLengthLimit) {
            reject(`Room name should be within ${roomLengthLimit} characters`)
        }

        const tempUsername = username.toLowerCase()
        const tempRoom = room.toLowerCase()

        if (!rooms.has(tempRoom)) {
            // room does not exist
            reject('Room does not exist. Please check spelling or create new room.')
        }

        const existingRoom = rooms.get(tempRoom)

        bcrypt.compare(password, existingRoom.password).then((result) => {
            if(!result){
                // incorrect password
                return reject('Password is incorrect.')
            }

            if (existingRoom.userList.length >= existingRoom.roomCap) {
                return reject('Room capacity exceeded.')
            }

            // check for existing users
            const otherUser = existingRoom.userList[0]

            if (otherUser) {
                room = otherUser.room // room name should match with pre-exsting room
            }
            const existingUser = existingRoom.userList.find((user) => {
                return user.username.toLowerCase() === tempUsername
            })

            if (existingUser) {
                return reject('Username is in use within current room!')
            }

            // store user
            const user = { id, username, room }
            rooms.get(tempRoom).userList.push(user)
            return resolve(user)
        })
    })
}

const removeUser = ({ room, id }) => {
    if (room) {
        room = room.toLowerCase()
        if (rooms.has(room)) {
            const index = rooms.get(room).userList.findIndex((user) => user.id === id)
            if (index !== -1) {
                const removed = rooms.get(room).userList.splice(index, 1)[0]
                if (rooms.get(room).userList == false) {
                    // room empty
                    rooms.delete(room)
                }

                return removed
            }
        }
    }
}

const getUser = ({ room, id }) => {
    room = room.toLowerCase()
    if (rooms.has(room)) {
        return rooms.get(room).userList.find((user) => user.id === id)
    }
}

const getUsersInRoom = (room) => {
    room = room.toLowerCase()
    const currentRoom = rooms.get(room)
    if (currentRoom) {
        return currentRoom.userList
    }
}

const getRoomData = (room) => {
    return rooms.get(room)
}



// room management
const createRoom = ({ roomName, hostName, password, roomCap }) => {
    roomName = roomName.trim()

    return new Promise((resolve, reject) => {
        if (rooms.has(roomName.toLowerCase())) {
            reject("Room name already taken.")
        }
        else if (roomName.length > roomLengthLimit) {
            reject(`Room name should be within ${roomLengthLimit} characters`)
        }
        else if (hostName.length > usernameLengthLimit) {
            reject(`Host name should be within ${usernameLengthLimit} characters`)
        }
        else if (password.length > passwordLengthLimit) {
            reject(`Password length should be within ${passwordLengthLimit}`)
        }
        else {

            if (password.trim()) {
                // password provided
                password = bcrypt.hash(password, 8).then((result) => {
                    rooms.set(roomName.toLowerCase(), {
                        userList: [],
                        password: result,
                        roomCap
                    })
                    resolve("Successfully created room.")
                }).catch((e) => {
                    reject(e)
                })
            } else {
                // no password provided
                rooms.set(roomName.toLowerCase(), {
                    userList: [],
                    password: undefined,
                    roomCap
                })
                resolve("Successfully created room.")
            }
        }
    })
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRoomData,
    createRoom
}