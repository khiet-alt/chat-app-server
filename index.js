const express = require('express');
const http = require('http')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js')

io.on("connection", (socket) => {   // socket in here(socket instance) indicates socket in client (read emitting events docs)
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({id: socket.id, name, room})
        if (error)
            return callback(error)
        socket.join(room)

        socket.emit('message', { user: 'admin', text: `${name}, welcome to room ${room}.`});
        socket.broadcast.to(room).emit('message', { user: 'admin', text: `${name} has joined!` });

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', {user: user.name, text: message})
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if (user){
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.`})
        }
    })
})

app.use(router)     // use as middleware

server.listen(PORT, () => {
    console.log(`Server has started on ${PORT}`)
})