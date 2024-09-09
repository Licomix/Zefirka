import {Events, KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {EmbedBuilder, TextChannel, VoiceChannel} from "discord.js";
import { bot } from "../index";


export default {
    name: Events.PlayerStart,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        setTimeout(async () => {
            if (!player) return;

            const voiceChannel = bot.client.channels.cache.get(player.voiceId!) as VoiceChannel;
            if (voiceChannel.members.size === 1) {
                await player.destroy();

                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription('I left the voice channel because there were no participants.');

                const textChannel = bot.client.channels.cache.get(player.textId!) as TextChannel;
                if (textChannel) await textChannel.send({ embeds: [embed] });
                await bot.pickDefaultPresence();
            }
        }, 60000);
    }
}
