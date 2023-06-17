const socket = io("http://localhost:5000", {})

const clientsTotal = document.getElementById('clients-total')

const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const messageTone = new Audio("audio.mp3")
messageTone.muted = true;

socket.on('clients-total', (data) => {
    // console.log(data)
    clientsTotal.innerHTML = `Total Clients: ${data}`
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage()
})

function sendMessage() {
    if (messageInput.value === '') {
        return
    }
    // console.log(messageInput.value)
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    }
    socket.emit('message', data)
    // this emit is just like commit with message  you can listen 
    // this event with the name anywhere
    addMessageToUi(true, data)
    messageInput.value = ''
}

function playMessageTone() {
    // Check if the audio is already playing
    if (messageTone.paused) {
        // Play the audio
        messageTone.muted = false; // Unmute the audio
        messageTone.play().then(() => {
            console.log("Audio started")
        }).catch((err) => {
            console.log("Audio playback failed:", err.message)
        })
    }
}

socket.on('chat-message', (data) => {
    // console.log(data)
    // before that this message was console only on the sender 
    // but now due to main.js it will console on all the receivers also 
    // due to bradcast
    playMessageTone()
    addMessageToUi(false, data)
})


function addMessageToUi(isOwnMessage, data) {
    clearFeedback()
    const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
                <p class="message">
                    ${data.message}
                    <span>${data.name} ⚪ ${moment(data.dateTime).fromNow()}</span>
                </p>
            </li>
    `

    messageContainer.innerHTML += element
    scrollToBottom()
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', () => {
    socket.emit('feedback', {
        // json object
        feedback: `${nameInput.value} is typing ...`
    })
})

messageInput.addEventListener('keypress', () => {
    socket.emit('feedback', {
        // json object
        feedback: `${nameInput.value} is typing ...`
    })
})

messageInput.addEventListener('blur', () => {
    socket.emit('feedback', {
        // json object
        feedback: ''
    })
})

socket.on('feedbackReturn', (data) => {
    clearFeedback()
    const element = `<li class="message-feedback">
    <p class="feedback" id="feedback">
        ${data.feedback}
    </p>
</li>`

    messageContainer.innerHTML += element
})

function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(element=>{
        element.parentNode.removeChild(element)
    })
}