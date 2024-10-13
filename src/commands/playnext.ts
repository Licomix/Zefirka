import {ChatInputCommandInteraction, GuildMember, InteractionContextType, SlashCommandBuilder} from "discord.js";
import { bot } from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName("playnext")
        .setDescription("Add track to the next position")
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Music link or search query')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const query = interaction.options.getString('url', true);

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        let result = await kazagumo.search(query, { requester: interaction.member! });

        try {
            player.queue.unshift(...result.tracks)
            const loadingEmbed = {
                color: 0xA020F0,
                description: result.type === "PLAYLIST"
                ? `**Inserted to queue:** ${result.playlistName}.`
                : `**Inserted to queue:** ${result.tracks[0].title}.`
            };
            await interaction.followUp({ embeds: [loadingEmbed] });
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
};
