import {CommandInteraction, GuildMember, InteractionContextType, SlashCommandBuilder, Message} from "discord.js";
import { bot } from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop playback")
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        try {
            const lastMessage = player.data.get("message") as Message;
            if (lastMessage) {
                try {
                    await lastMessage.delete();
                } catch (error) {
                    console.error('Error deleting "Now Playing" message:', error);
                }
                player.data.delete("message");
            }
            await player.destroy();
            await interaction.followUp({ content: 'Playback stopped. Hope you enjoyed!' });
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
};
