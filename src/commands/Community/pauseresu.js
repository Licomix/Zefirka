const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pauseresu')
        .setDescription('Pause or Resume playback.'),
    async execute(interaction, client) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.followUp({ content: 'You are not in a voice channel!' });
        }

        const kazagumo = client.kazagumo;
        const player = kazagumo.players.get(interaction.guildId);
        if (!player) {
            return interaction.followUp({ content: 'Nothing is playing!' });
        }

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) {
            return interaction.followUp({ content: 'I am in a different voice channel!' });
        }

        try {
            if (player.paused === true) {
                await player.pause(false);
                return interaction.followUp({ content: 'Playback resumed!' });
            } else {
                await player.pause(true);
                return interaction.followUp({ content: 'Playback paused!' });
            }
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
}
