import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle, ChatInputCommandInteraction,
    GuildMember, Interaction,
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";
import {PlayerState} from "kazagumo";
import {bot} from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for music from your favorite platforms!")
        .setContexts(InteractionContextType.Guild)
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

        const tracks = result.tracks.slice(0, 5); // Get top 5 results

        const embed = {
            color: 0x00ff00,
            title: 'Search Results',
            description: tracks.map((track, i) => `${i + 1}. ${track.title}`).join('\n'),
            footer: { text: 'Select a song using the buttons below.' }
        };

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                ...tracks.map((_, i) =>
                    new ButtonBuilder()
                        .setCustomId(`select_${i}`)
                        .setLabel(`${i + 1}`)
                        .setStyle(ButtonStyle.Primary)
                )
            );

        const message = await interaction.followUp({ embeds: [embed], components: [row] });

        const filter = (i: Interaction) => i.isMessageComponent() && i.customId.startsWith('select_') && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const selected = parseInt(i.customId.split('_')[1]);
            const selectedTrack = tracks[selected];

            player.queue.add(selectedTrack);

            if (!player.playing && !player.paused) {
                await player.play();
            }

            const loadingEmbed = {
                color: 0x00ff00,
                description: `**Added to queue:** ${selectedTrack.title}`
            };

            await i.update({ embeds: [loadingEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('Search timed out. Please try again.');
            }
        });
    }
};