const socket = io()

// elements
const $createForm = document.querySelector('#create-form')
const $createFormButton = $createForm.querySelector(".index-button")

const test = document.querySelector(".index-button")

$createForm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log(e.target.elements.room_cap.value)
    $createFormButton.setAttribute('disabled', 'disabled')
})