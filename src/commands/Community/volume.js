const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the volume')
        .addIntegerOption(option =>
            option
                .setName('volume')
                .setDescription('Desired volume')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200))
        .setDMPermission(false),
    async execute(interaction, client) {
        await interaction.deferReply();
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        const kazagumo = client.kazagumo;
        const player = kazagumo.players.get(interaction.guildId);
        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        const volume = interaction.options.getInteger('volume');

        try {
            await player.setVolume(volume);
            await interaction.followUp({ content: `Volume changed to ${volume}` });
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
}
