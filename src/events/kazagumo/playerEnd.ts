import {Events, KazagumoPlayer, KazagumoTrack} from "kazagumo";
import {EmbedBuilder, Message, TextChannel, VoiceChannel} from "discord.js";
import { bot } from "../../index";


export default {
    name: Events.PlayerEnd,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        // Remove the "Now Playing" embed
        const lastMessage = player.data.get("message") as Message;
        if (lastMessage && lastMessage.deletable) {
            try {
                await lastMessage.delete();
            } catch (error) {
                console.error('Error deleting "Now Playing" message:', error);
            }
            player.data.delete("message");
        }

        setTimeout(async () => {
            if (!player) return;

            const guild = bot.client.guilds.cache.get(player.guildId);
            if (!guild) return;

            const voiceChannel = guild.channels.cache.get(player.voiceId!) as VoiceChannel | undefined;
            
            if (!voiceChannel || voiceChannel.members.size === 1) {
                try {
                    await player.destroy();
                } catch (error) {
                    console.error("Error destroying player:", error);
                }

                const textChannel = bot.client.channels.cache.get(player.textId!) as TextChannel;
                if (textChannel) {
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('I left the voice channel because there were no participants.');
                    await textChannel.send({ embeds: [embed] });
                }
                await bot.pickDefaultPresence();
            }
        }, 60000);
    }
}
