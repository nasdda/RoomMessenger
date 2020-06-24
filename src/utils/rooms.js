const rooms = new Map()
const usernameLengthLimit = 40
const roomLengthLimit = 40

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
                error: `Room name should be within ${usernameLengthLimit} characters`
            }
        }
    }

    // check for existing users
    const tempUsername = username.toLowerCase()
    const tempRoom = room.toLowerCase()
    if (rooms.has(tempRoom)) {
        const pastRoom = rooms.get(tempRoom)[0]
        if(pastRoom) {
            room = pastRoom.room // room name should match with pre-exsting room
        }
        const existingUser = rooms.get(tempRoom).find((user) => {
            return user.username.toLowerCase() === tempUsername
        })

        if (existingUser) {
            return {
                error: 'Username is in use within current room!'
            }
        }
    } else {
        // new room
        rooms.set(tempRoom, [])
    }

    // store user
    const user = { id, username, room }
    rooms.get(tempRoom).push(user)
    return { user }
}

const removeUser = ({ room, id }) => {
    if (room) {
        room = room.toLowerCase()
        if (rooms.has(room)) {
            const index = rooms.get(room).findIndex((user) => user.id === id)
            if (index !== -1) {
                const removed = rooms.get(room).splice(index, 1)[0]
                if (rooms.get(room) == false) {
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
        return rooms.get(room).find((user) => user.id === id)
    }
}

const getUsersInRoom = (room) => {
    room = room.toLowerCase()
    return rooms.get(room)
}

const getAllRoomData = () => {
    return rooms
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllRoomData
}