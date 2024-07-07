const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop playback"),
    async execute(interaction, client) {
        await interaction.deferReply();

        const kazagumo = client.kazagumo;
        const player = kazagumo.players.get(interaction.guildId);

        if (!interaction.member.voice.channel) {
            return interaction.followUp({ content: 'You are not in a voice channel!' });
        }
        if (!player) {
            return interaction.followUp({ content: 'Nothing is playing!' });
        }

        try {
            player.destroy();
            await interaction.followUp({ content: 'Playback stopped. Hope you enjoyed!' });
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.error(error);
        }
    }
}
