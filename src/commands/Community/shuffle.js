const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles all songs in the queue'),

    async execute(interaction, client) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        const kazagumo = client.kazagumo;
        const player = kazagumo.players.get(interaction.guildId);
        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        try {
            await player.queue.shuffle();
            await interaction.followUp({ content: 'Queue shuffled!' });
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
}
