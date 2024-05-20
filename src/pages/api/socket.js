// import { Server } from "socket.io";
// import cors from 'cors';

// // Create a new instance of the CORS middleware
// const corsMiddleware = cors();


// export default function SocketHandler(req: any, res: any) {

//     if (res.socket.server.io) {
//         console.log('Socket is already running')
//         console.log("Already set up");
//         res.end();
//         return;
//     }

//     const io = new Server(res.socket.server, {
//         path: "/api/socket",
//         addTrailingSlash: false
//     });
//     console.log('Socket is initializing')
//     res.socket.server.io = io
//     io.on('connection', socket => {
//         socket.on('send_tokens', tokens => {
//             console.log(tokens);
//             socket.broadcast.emit('receive_tokens', tokens)
//         })
//     })
//     // Apply the CORS middleware to the request and response
//     corsMiddleware(req, res, () => {
//         res.socket.server.io = io;
//         res.end();
//     });

// }

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});


io.on('connection', socket => {
    socket.on('send_tokens', tokens => {
        console.log(tokens);
        socket.broadcast.emit('receive_tokens', tokens)
    })
});

server.listen(3001, () => {
  console.log('Socket server listening on http://localhost:3001');
});
