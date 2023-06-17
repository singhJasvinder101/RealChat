const express = require('express')
const app = express()
const port = process.env.PORT || 5000

app.use(express.static('public'))

const server = app.listen(port, ()=>{
    console.log("server on port http://localhost:5000")
})
const io = require('socket.io')(server)

let socketConnected = new Set()


// io.on('connection', (socket)=>{
//     console.log(socket.id)
// })
io.on('connection', onConnected)

function onConnected(socket){
    console.log(socket.id)
    socketConnected.add(socket.id)

    io.emit('clients-total', socketConnected.size)

    socket.on('disconnect', ()=>{
        socketConnected.delete(socket.id)
        console.log('socket disconnected')

        io.emit('clients-total', socketConnected.size)
    })

    socket.on('message', (data)=>{
        // console.log(data)
        socket.broadcast.emit('chat-message', data)
    })

    socket.on('feedback', (data)=>{
        socket.broadcast.emit('feedbackReturn', data)
    })
}

