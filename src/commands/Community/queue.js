const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View the upcoming songs.'),

    async execute(interaction, client) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        const kazagumo = client.kazagumo;
        const player = kazagumo.players.get(interaction.guildId);
        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        const tracks = player.queue.slice(0, 10);

        const embed = {
            color: 0x0000ff,
            title: "Current Queue of Tracks",
            description: `**Now playing:**\n${player.queue.current.title}\n\n**Up next:\n\n**`,
            thumbnail: {
                url: player.queue.current.thumbnail
            },
            fields: [],
        };
        let i = 1;
        let tracksDescription = '';

        for (const track of tracks) {
            let trackTitle = track.title.substring(0, 35);
            let formattedTitle = `${i}. ${trackTitle}${track.title.length > 35 ? '...' : ''}`;

            if (i % 2 === 0) {
                formattedTitle = `**${formattedTitle}**`;
            } else {
                formattedTitle = `_${formattedTitle}_`;
            }

            tracksDescription += `${formattedTitle}\n`;

            i++;
        }

        if (tracksDescription) {
            embed.description +=  tracksDescription;
        }

        return await interaction.followUp({ embeds: [embed] });
    }
}
