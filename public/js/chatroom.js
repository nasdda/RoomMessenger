const socket = io()

// elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("#message-input")
const $messageFormButton = $messageForm.querySelector("#send-button")
const $messages = document.querySelector('#messages')


// queue options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


// Mustache Templates
const messageTemplate = document.querySelector('#message-template').innerHTML


// message received
socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


// element listeners
$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            alert(error)
        }
    })
})




// let server know user has joined
socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/' // go back to index
    }
})