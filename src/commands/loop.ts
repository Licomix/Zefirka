import {
    ChatInputCommandInteraction, GuildMember, InteractionContextType, SlashCommandBuilder} from "discord.js";
import { bot } from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Set loop mode")
        .setContexts(InteractionContextType.Guild).addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'none' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' },
                )),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const repeatMode = interaction.options.getString('mode', true) as 'none' | 'track' | 'queue';

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        try {
            player.setLoop(repeatMode);
            await interaction.followUp({ content: `Loop mode set to ${repeatMode}` });
        } catch (error) {
            await interaction.followUp({ content: 'Oops, something went wrong. Please try again.' });
            console.error(error);
        }
    }
};