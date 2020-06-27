const socket = io()

// elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("#message-input")
const $messageFormButton = $messageForm.querySelector("#send-button")
const $messages = document.querySelector('#messages')


// queue options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


// Mustache Templates
const messageTemplateOthers = document.querySelector('#message-template-others').innerHTML
const messageTemplateSelf = document.querySelector("#message-template-self").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML


const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    // dont autoscroll if user is not on the bottom of the chat
    if (containerHeight - newMessageHeight - 1 <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


// message received
socket.on("message", (message) => {
    const html = Mustache.render(message.username === username ? messageTemplateSelf : messageTemplateOthers,
        {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


// room data received
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#chat-sidebar").innerHTML = html
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
            socket.disconnect()
            alert(error)
        }
    })
})


socket.emit('validateJoin', { username, room }, (hashedPassword) => {
    if (hashedPassword) {
        // password is required
        var password = window.prompt("Please enter password", "")
        socket.emit('join', { username, room, password }, (error) => {
            if (error) {
                alert(error)
                location.href = '/' // go back to index
            }
        })
    } else {
        // no password is required
        socket.emit('join', { username, room, password: undefined }, (error) => {
            if (error) {
                alert(error)
                location.href = '/' // go back to index
            }
        })
    }
})






