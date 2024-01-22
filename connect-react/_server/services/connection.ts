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
    }
}