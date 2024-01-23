import { genLobbyId } from "../helper/lobbyHelper";
import { ConnectionType, UserType } from "./types.model";

export class Connection {
    private lobby: Record<string, ConnectionType>;
    constructor() {
        this.lobby = {} 
    }

    createLobby(user1: UserType, user2: UserType) {
        const lobbyId = genLobbyId();
        this.lobby[lobbyId.toString()] =  {
            user1, 
            user2,
        }

        user1.socket.emit("send-offer", {
            lobbyId
        })

        user2.socket.emit("send-offer", {
            lobbyId
        })
    }

    onOffer(lobbyId: string, sdp: string, senderSocketid: string) {
        const lobby = this.lobby[lobbyId];
        if (!lobby) {
            return;
        }
        console.log(this.lobby)
        const receivingUser = lobby.user1.socket.id === senderSocketid ? lobby.user2: lobby.user1;
        receivingUser?.socket.emit("offer", {
            sdp,
            lobbyId
        })
    }
    
    onAnswer(lobbyId: string, sdp: string, senderSocketid: string) {
        const lobby = this.lobby[lobbyId];
        if (!lobby) {
            return;
        }
        const receivingUser = senderSocketid === lobby.user1.socket.id ? lobby.user2: lobby.user1;

        receivingUser?.socket.emit("answer", {
            sdp,
            lobbyId
        });
    }

    onIceCandidates(lobbyId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const lobby = this.lobby[lobbyId];
        if (!lobby) {
            return;
        }
        const receivingUser = lobby.user1.socket.id === senderSocketid ? lobby.user2: lobby.user1;
        receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
    }
}