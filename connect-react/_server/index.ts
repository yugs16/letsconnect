import { Socket } from "socket.io";
import http from "http";

import express from 'express';
import { Server } from 'socket.io';

import { Users } from "./services/users";

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const users = new Users();

io.on('connection', (socket: Socket) => {
  console.log('connect', socket);
  users.add("name", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  })
});

server.listen(3000, () => {
    console.log('listening on http://localhost:8000');
});