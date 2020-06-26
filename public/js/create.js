const socket = io()

// elements
const $createForm = document.querySelector('#create-form')
const $createFormButton = $createForm.querySelector(".index-button")

$createForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $createFormButton.setAttribute('disabled', 'disabled')
    // extract values of form
    const roomName = e.target.elements.roomName.value
    const hostName = e.target.elements.hostName.value
    const password = e.target.elements.password.value
    const roomCap = parseInt(e.target.elements.roomCap.value)

    socket.emit('createRoom', { roomName, hostName, password, roomCap }, (error) => {
        if (error) {
            // failed to create room
            alert(error)
            $createFormButton.removeAttribute('disabled')
        } else {
            // successfully created room
            socket.disconnect() // purpose of current connection is finished
            location.href = `./chatroom.html?username=${hostName}&room=${roomName}`
        }
    })
})