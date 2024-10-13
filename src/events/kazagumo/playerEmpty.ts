import {Events, KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {EmbedBuilder, TextChannel, Message} from "discord.js";
import { bot } from "../../index";


export default {
    name: Events.PlayerEmpty,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        if (!player.queue.length) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('The queue is finished.');

            const channel = bot.client.channels.cache.get(player.textId!) as TextChannel;
            if (channel) await channel.send({ embeds: [embed] });
            setTimeout(async () => {
                if (!player.queue.length) {
                    await player.destroy();

                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('I left the voice channel due to a lack of activity');

                    if (channel) await channel.send({ embeds: [embed] });
                    await bot.pickDefaultPresence();
                }
            }, 60000);
        }

        // Remove the "Now Playing" embed
        const lastMessage = player.data.get("message") as Message;
        if (lastMessage) {
            try {
                await lastMessage.delete();
            } catch (error) {
                console.error('Error deleting "Now Playing" message:', error);
            }
            player.data.delete("message");
        }
    }
}
