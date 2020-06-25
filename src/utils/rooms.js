const rooms = new Map()
/*
    rooms Map format:
    room name -> { userList: list, password: encrypted string, numberOfUsers: integer }
*/

const usernameLengthLimit = 30
const roomLengthLimit = 35

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
        // new room
        rooms.set(tempRoom, {
            userList: [],
            password: undefined,
            numberOfUsers: 0
        })
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
    return rooms.get(room).userList
}

const getAllRoomData = () => {
    return rooms
}



// room management
const createRoom = (roomName) => {
    if (rooms.has(roomName)) {
        return {
            error: "Room name already taken."
        }
    }

    if (roomName.length > roomLengthLimit) {
        return {
            error: `Room name should be within ${roomLengthLimit} characters`
        }
    }

    rooms.set(roomName, [])
    return {
        success: "Room created."
    }
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllRoomData,
    createRoom
}