const express = require('express');
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = new socketio.Server(server)

app.use(cors({
    origin: '*'
}))

io.on("connection", (socket) => {
    console.log("New connection")

    socket.on("chat message", (msg) => {
        io.emit('chat message', msg)
    })

    socket.on("disconnect", () => {
        console.log("user had left!")
    })
})

app.use(router)     // use as middleware

server.listen(PORT, () => {
    console.log(`Server has started on ${PORT}`)
})