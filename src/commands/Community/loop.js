const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode.')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode.')
                .setRequired(true)
                .addChoices(
                    { name: 'Off.', value: 'none' },
                    { name: 'Track.', value: 'track' },
                    { name: 'Queue.', value: 'queue' },
                )),
    async execute(interaction, client) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        const kazagumo = client.kazagumo;
        const player = kazagumo.players.get(interaction.guildId);
        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        let repeatMode = interaction.options.getString('mode');
        try {
            await player.setLoop(repeatMode);
            await interaction.followUp({ content: `Loop mode set to ${repeatMode}.` });
        } catch (error) {
            await interaction.followUp({ content: 'Oops, something went wrong. Please try again.' });
            console.error(error);
        }
    }
}
