import {Events, KazagumoError, KazagumoPlayer, KazagumoTrack} from "kazagumo";


export default {
    name: Events.PlayerError,
    async execute(player: KazagumoPlayer, track: KazagumoTrack, err: KazagumoError) {
        console.log(`Player error in guild ${player.guildId}, error: ${err}`);
    }
}