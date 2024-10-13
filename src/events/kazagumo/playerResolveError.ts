import {Events, KazagumoError, KazagumoPlayer, KazagumoTrack} from "kazagumo";


export default {
    name: Events.PlayerResolveError,
    async execute(player: KazagumoPlayer, track: KazagumoTrack, err: KazagumoError) {
        console.log(`Resolve error for track ${track.title} in guild ${player.guildId}, error: ${err}`);
    }
}
