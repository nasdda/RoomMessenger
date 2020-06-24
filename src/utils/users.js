const users = []
const usernameLengthLimit = 40
const roomLengthLimit = 40

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim()
    room = room.trim()

    // Confirm data is valid
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

    // Check for existing user
    const tempUsername = username.toLowerCase()
    const tempRoom = room.toLowerCase()
    const existingUser = users.find((user) => {
        if( user.room.toLowerCase() === tempRoom ) {
            // room should match case with prexisting room
            room = user.room
            return user.username.toLowerCase() === tempUsername
        }

        return false
    })

    if (existingUser) {
        return {
            error: 'Username is in use within current room!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)

    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room.toLowerCase() === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}