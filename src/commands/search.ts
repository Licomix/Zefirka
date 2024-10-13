import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    GuildMember,
    Interaction,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import { PlayerState } from "kazagumo";
import { bot } from "../index";

export default {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for music from your favorite platforms!")
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Search query')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        const query = interaction.options.getString('query');

        const kazagumo = bot.manager;
        let player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) {
            player = await kazagumo.createPlayer({
                guildId: interaction.guild!.id,
                textId: interaction.channel!.id,
                voiceId: voiceChannel.id,
                volume: 100,
                deaf: true,
            });
        } else if (player.state === PlayerState.DISCONNECTED) {
            player.setVoiceChannel(voiceChannel.id);
            player.setTextChannel(interaction.channel!.id);
        } else if (player.voiceId !== voiceChannel.id) {
            return interaction.followUp({ content: 'I am in a different voice channel!' });
        }

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        let result = await kazagumo.search(query!, { requester: member });

        if (!result.tracks.length) return interaction.followUp("Sorry, nothing found.");

        const tracks = result.tracks.slice(0, 10); // Get top 10 results

        const embed = {
            color: 0xA020F0,
            title: `Search Results for "${query}"`,
            description: tracks.map((track, i) => `${i + 1}. [${track.title}](${track.realUri}) - ${track.author} - ${formatDuration(track.length ?? 0)}`).join('\n')
        };

        const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('song_select')
                    .setPlaceholder('Select a song')
                    .addOptions(tracks.map((track, index) => ({
                        label: `${index + 1}. ${track.title}`.substring(0, 100),
                        description: `${track.author} - ${formatDuration(track.length ?? 0)}`.substring(0, 100),
                        value: index.toString()
                    })))
            );

        const message = await interaction.followUp({ embeds: [embed], components: [selectMenu] });

        const collector = message.createMessageComponentCollector({ 
            filter: (i) => i.customId === 'song_select' && i.user.id === interaction.user.id,
            time: 30000
        });

        collector.on('collect', async i => {
            if (!i.isStringSelectMenu()) return;
            await i.deferUpdate();

            const selected = parseInt(i.values[0]);
            const selectedTrack = tracks[selected];

            player.queue.add(selectedTrack);

            if (!player.playing && !player.paused) {
                await player.play();
            }

            const loadingEmbed = {
                color: 0xA020F0,
                description: `**Added to queue:** ${selectedTrack.title}`
            };

            await i.editReply({ embeds: [loadingEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('Song selection timed out. Please try again.');
            }
        });
    }
};

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;
}
