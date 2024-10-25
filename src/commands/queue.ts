import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder, GuildMember, Interaction, InteractionContextType, SlashCommandBuilder} from "discord.js";
import { bot } from "../index"
import { KazagumoPlayer, KazagumoQueue, } from "kazagumo";


export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the upcoming songs")
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        if (!player.queue) return interaction.followUp({ content: "Nothing in queue!" });

        async function createPageEmbed(player: KazagumoPlayer, queue: KazagumoQueue, page: number): Promise<EmbedBuilder> {
            const pageSize = 10;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;

            const tracks = player.queue.slice(startIndex, endIndex);
            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setTitle("Current Queue of Tracks")
                .setThumbnail(player.queue.current!.thumbnail as string);

            const currentTrack = player.queue.current

            let i = startIndex + 1;
            let embedDescription = `**Now playing: [Click Me](${currentTrack!.uri})**\n\`${currentTrack!.title}\`\n**Upcoming Queue:\n**`

            for (const track of tracks) {
                let trackTitle = track.title.substring(0, 30);
                embedDescription += `\`${i}.\` **${track.author} - ${trackTitle}**\n`
                i++;
            }
            embed.setDescription(embedDescription)
            return embed;
        }
        let currentPage = 1;

        const embed = await createPageEmbed(player, player.queue, currentPage);

        let totalPages = Math.ceil(player.queue.length / 10);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('⬅️ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 1),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next ➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage >= totalPages),
                new ButtonBuilder()
                    .setCustomId('clearQueue')
                    .setLabel('🗑️')
                    .setStyle(ButtonStyle.Danger),
            );

        const message = await interaction.followUp({ embeds: [embed], components: [row] });

        const filter = (interaction: Interaction) => {
            return interaction.isButton() && interaction.user.id === member.id;
        };

        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === "prev" && currentPage > 1) {
                currentPage -= 1;
            } else if (interaction.customId === "next" && currentPage < totalPages) {
                currentPage += 1;
            } else if (interaction.customId === "clearQueue") {
                player.queue.clear();
                totalPages = 0;
            }

            const newPageEmbed = await createPageEmbed(player, player.queue, currentPage);

            row.components[0].setDisabled(currentPage === 1);
            row.components[1].setDisabled(currentPage >= totalPages);

            await interaction.update({ embeds: [newPageEmbed], components: [row] });
        });

        collector.on('end', () => {
            row.components.forEach(button => button.setDisabled(true));
            message.edit({ components: [row] });
        });

    }
};
