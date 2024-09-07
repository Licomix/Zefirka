const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music from your favorite platforms!')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Music link')
                .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });
        const query = interaction.options.getString('url');

        const kazagumo = client.kazagumo;

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        let player = await kazagumo.createPlayer({
            guildId: interaction.guild.id,
            textId: interaction.channel.id,
            voiceId: voiceChannel.id,
            volume: 100,
            deaf: true,
        });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        let result = await kazagumo.search(query, { requester: interaction.member.displayName });

        if (!result.tracks.length) return interaction.followUp("Sorry, nothing found.");

        if (result.type === "PLAYLIST") {
            for (let track of result.tracks) {
                player.queue.add(track);
            }
        } else {
            await player.queue.add(result.tracks[0]);
        }

        if (!player.playing && !player.paused) {
            player.play();
        }

        if (result.type === "PLAYLIST") {
            const loadingEmbed = {
                color: 0x00ff00,
                description: `**Added to queue:** ${result.playlistName}.`
            };
            await interaction.followUp({ embeds: [loadingEmbed] });
        } else {
            const loadingEmbed = {
                color: 0x00ff00,
                description: `**Added to queue:** ${result.tracks[0].title}.`
            };
            await interaction.followUp({ embeds: [loadingEmbed] });
        }
    }
}
