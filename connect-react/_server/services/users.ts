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
        this.connection = new Connection();
    }

    addListeners(socket: Socket) {
        socket.on("offer", ({sdp, lobbyId}: {sdp: string, lobbyId: string}) => {
            console.log('on offer======', lobbyId);
            this.connection.onOffer(lobbyId, sdp, socket.id);
        })

        socket.on("answer",({sdp, lobbyId}: {sdp: string, lobbyId: string}) => {
            console.log('on answer======', lobbyId);

            this.connection.onAnswer(lobbyId, sdp, socket.id);
        })

        socket.on("add-ice-candidate", ({candidate, lobbyId, type}) => {
            
            console.log('on add-ice-candidate======', lobbyId);

            this.connection.onIceCandidates(lobbyId, socket.id, candidate, type);
        });
    }

    add(name: string, socket: Socket) {
        this.users.push({
            name, socket
        })
        this.socketIds.push(socket.id);
        socket.emit("lobby");
        this.addListeners(socket);
        this.connect()
    }

    remove(socketId: string) {
        
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.socketIds = this.socketIds.filter(x => x === socketId);
    }

    connect() {
        console.log('connect fn ', this.socketIds.length);
        if (this.socketIds.length < 2) {
            return;
        }

        const id1 = this.socketIds.pop();
        const id2 = this.socketIds.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        if (!user1 || !user2) {
            return;
        }
        console.log("creating connection lobby");

        const lobby = this.connection.createLobby(user1, user2);
        this.connect();
    }



}