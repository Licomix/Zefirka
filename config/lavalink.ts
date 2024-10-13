import { NodeOption }  from "shoukaku";

export const kazagumoNode: NodeOption[] = [
    {
        name: process.env.LAVALINK_NAME || "Owo",
        url: process.env.LAVALINK_URL || "localhost:2333",
        auth: process.env.LAVALINK_PASSWORD || "youshallnotpass",
    }
]