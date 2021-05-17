const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const {Server} = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8080", "http://192.168.1.87:8080"],
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true,
    upgrade: false
})


app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});

const users = [];

io.on('connection', (socket) => {
    console.log('A user connected');
    console.log(socket.id)
    socket.on('disconnect', ()=>{
        console.log('User disconnect')
        users.forEach(data => {
            if(data.id === socket.id){
                io.emit('leaveUser', data.name);
                users.splice(users.indexOf(data), 1)
            }
        })
        io.emit('updateUsers', users)
    });
    socket.on('isWriting', (tap) =>{
        console.log('User write a message', tap)
        io.emit('isWriting', tap)
    });
    socket.on('chatMessage', (msg) =>{
        console.log('User send Message : ', msg)
        io.emit('chatMessage', msg)
    });
    socket.on('newUser', (user) =>{
        console.log('NewUser : ', user)
        users.push({
            id: socket.id,
            name: user
        })
        io.emit('newUser', users, user)
    });
});

server.listen(3000,  "192.168.1.87", ()=> {
    console.log(`Server is running on port 3000`);
});
