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

// room information
let host


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
socket.on('roomData', ({ room, users, hostName }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#chat-sidebar").innerHTML = html

    // extract host name on initial call
    if (!host) {
        host = hostName
    }

    // add kick functionality for each username
    const $sidebarUsernames = document.querySelectorAll(".sidebar-username")
    if (username === host) { // only host can kick
        $sidebarUsernames.forEach((e) => {
            e.addEventListener('mouseover', (e) => {
                if (e.target.innerText !== host) {
                    e.target.style.color = "red"
                }
            })
        })

        $sidebarUsernames.forEach((e) => {
            e.addEventListener('click', (e) => {
                if (e.target.innerText !== host) { // cannot kick host 
                    if(window.confirm(`Kick ${e.target.innerText}?`)){
                        socket.emit('kick', { userToKick: e.target.innerText, room }, (error) => {
                            if (error) {
                                alert(error)
                            }
                        })
                    }
                } else {
                    alert('Cannot kick yourself.')
                }
            })
        })

        $sidebarUsernames.forEach((e) => {
            e.addEventListener('mouseleave', (e) => {
                if (e.target.innerText !== host) {
                    e.target.style.color = "white"
                }
            })
        })
    } else {
        // non host users attempted to kick
        $sidebarUsernames.forEach((e) => {
            e.addEventListener('click', (e) => {
                alert('Only the host can kick users.')
            })
        })
    }
})

// kicked by host
socket.on('kicked', ({ userToKick }) => {
    if (username.toLowerCase() === userToKick.toLowerCase()) {
        socket.disconnect()
        alert('You have been kicked out by room host.')
        location.href = '/'
    }
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


// initial emit to server
socket.emit('validateJoin', { username, room }, (hashedPassword) => {
    if (hashedPassword) {
        // password is required
        let password = window.prompt("Please enter password", "")
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






