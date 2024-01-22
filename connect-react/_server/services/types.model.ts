import { Socket } from "socket.io";


export interface UserType {
    socket: Socket;
    name: string;
}

export interface ConnectionType {
    user1: UserType,
    user2: UserType,
}
