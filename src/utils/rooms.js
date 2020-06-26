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

const addUser = ({ id, username, room }) => {
    // remove extra spaces
    username = username.trim()
    room = room.trim()

    // confirm data is valid
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    } else {
        if (username.length > usernameLengthLimit) {
            return {
                error: `Username should be within ${usernameLengthLimit} characters`
            }
        }

        if (room.length > roomLengthLimit) {
            return {
                error: `Room name should be within ${roomLengthLimit} characters`
            }
        }
    }

    // check for existing users
    const tempUsername = username.toLowerCase()
    const tempRoom = room.toLowerCase()
    if (rooms.has(tempRoom)) {
        const otherUser = rooms.get(tempRoom).userList[0]
        if (otherUser) {
            room = otherUser.room // room name should match with pre-exsting room
        }
        const existingUser = rooms.get(tempRoom).userList.find((user) => {
            return user.username.toLowerCase() === tempUsername
        })

        if (existingUser) {
            return {
                error: 'Username is in use within current room!'
            }
        }
    } else {
        // room does not exist
        return {
            error: 'Room does not exist. Please check spelling or create new room.'
        }
    }

    // store user
    const user = { id, username, room }
    rooms.get(tempRoom).userList.push(user)
    return { user }
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

const getAllRoomData = () => {
    return rooms
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
        }
    })
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllRoomData,
    createRoom
}