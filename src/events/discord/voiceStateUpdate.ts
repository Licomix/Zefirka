import { Events, VoiceState, TextBasedChannel } from "discord.js";
import { bot } from "../../index";

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        const player = bot.manager.players.get(oldState.guild.id);

        if (!player) return;

        // Check if the bot is the one that changed voice state
        if (oldState.member?.id === bot.client.user?.id) {
            if (!newState.channelId) {
                // Bot was disconnected from a voice channel
                try {
                    await player.destroy();
                } catch (error) {
                    if (error instanceof Error) {
                        console.log("Error destroying player:", error.message);
                    } else {
                        console.log("Error destroying player:", String(error));
                    }
                }

                const textChannel = bot.client.channels.cache.get(player.textId!);
                if (textChannel?.isTextBased() && 'send' in textChannel) {
                    await textChannel.send("I was disconnected from the voice channel.");
                }

                // Remove the "Now Playing" embed
                const lastMessage = player.data.get("message");
                if (lastMessage) {
                    try {
                        await lastMessage.delete();
                    } catch (error) {
                        console.error('Error deleting "Now Playing" message:', error);
                    }
                    player.data.delete("message");
                }

                await bot.pickDefaultPresence();
            } else if (oldState.channelId !== newState.channelId) {
                // Bot moved to a different voice channel
                const textChannel = bot.client.channels.cache.get(player.textId!);
                player.setVoiceChannel(newState.channelId)
                if (textChannel?.isTextBased() && 'send' in textChannel) {
                    await textChannel.send(`I moved to a different voice channel: <#${newState.channelId}>`);
                }
            }
        }
    }
};
