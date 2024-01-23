let COUNT = 101;
export function genLobbyId() {
    return `${COUNT++}`;
}