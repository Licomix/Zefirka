import { CommandInteraction, GuildMember, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";

export default {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume playback")
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
            if (player.paused) {
                player.pause(false);
                return interaction.followUp({ content: 'Playback resumed!' });
            } else {
                return interaction.followUp({ content: 'Playback is already running!' });
            }
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
};
