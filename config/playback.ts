import {ShoukakuOptions} from "shoukaku";

 export const shoukakuOption: ShoukakuOptions = {
    resume: true, // Whether to resume a connection on disconnect to Lavalink (Server Side) (Note: DOES NOT RESUME WHEN THE LAVALINK SERVER DIES)
    userAgent: 'Zefirka', // is you change this that till be logged in lavalink
    resumeTimeout: 30,
    resumeByLibrary: true, // Whether to resume the players by doing it in the library side (Client Side) (Note: TRIES TO RESUME REGARDLESS OF WHAT HAPPENED ON A LAVALINK SERVER)
    reconnectTries: 5,
    reconnectInterval: 5,
    restTimeout: 60,
    moveOnDisconnect: false, // Whether to move players to a different Lavalink node when a node disconnects
    //voiceConnectionTimeout: 15,
    nodeResolver: (nodes) =>
        [...nodes.values()]
            .filter((node) => node.state === 2)
            .sort((a, b) => a.penalties - b.penalties)
            .shift(),
}