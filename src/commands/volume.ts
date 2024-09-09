import {ChatInputCommandInteraction, GuildMember, InteractionContextType, SlashCommandBuilder} from "discord.js";
import { bot } from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Skips the current music")
        .addIntegerOption(option =>
            option
                .setName('volume')
                .setDescription('Desired volume')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200))
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const volume = interaction.options.getInteger('volume') as number;

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        try {
            await player.setVolume(volume);
            await interaction.followUp({ content: `Volume changed to ${volume}` });
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
};