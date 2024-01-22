import { Socket } from "socket.io";
import { Connection } from "./connection";
import { UserType } from "./types.model";

export class Users {
    private users: UserType[];
    private socketIds: string[];
    private connection: Connection;
    
    constructor() {
        this.users = [];
        this.socketIds = [];
        this.connection = new Connection()
    }

    add(name: string, socket: Socket) {
        this.users.push({
            name, socket
        })
        this.socketIds.push(socket.id);
        socket.emit("lobby");
        this.connect()
    }

    remove(socketId: string) {
        
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.socketIds = this.socketIds.filter(x => x === socketId);
    }

    connect() {
        console.log(this.socketIds.length);
        if (this.socketIds.length < 2) {
            return;
        }

        const id1 = this.socketIds.pop();
        const id2 = this.socketIds.pop();

        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        const lobby = this.connection.createLobby(user1, user2);
    }

}