import {Events, KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {EmbedBuilder, TextChannel, Message} from "discord.js";
import { bot } from "../../index";

export default {
    name: Events.PlayerEmpty,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        const channel = bot.client.channels.cache.get(player.textId!) as TextChannel;
        if (!channel) {
            console.warn(`Text channel with ID ${player.textId} not found.`);
            return;
        }

        if (!player.queue.length) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('The queue is finished.');
            await channel.send({ embeds: [embed] });

            // Таймаут перед уничтожением игрока
            setTimeout(async () => {
                if (!player.queue.length) {
                    await player.destroy();

                    const leaveEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('I left the voice channel due to a lack of activity');
                    await channel.send({ embeds: [leaveEmbed] });
                    await bot.pickDefaultPresence();
                }
            }, 60000); // Таймаут в миллисекундах
        }

        // Удаление "Now Playing" сообщения
        const lastMessage = player.data.get("message") as Message;
        if (lastMessage && lastMessage.deletable) {
            try {
                await lastMessage.delete();
            } catch (error) {
                console.error('Error deleting "Now Playing" message:', error);
            }
            player.data.delete("message");
        }
    }
};

