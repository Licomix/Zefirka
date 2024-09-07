const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('empty')
    .setDescription('Clear queue'),
    async execute(interaction, client) {
        await interaction.deferReply();

        kazagumo = client.kazagumo
        const player = kazagumo.players.get(interaction.guildId)

        if (!interaction.member.voice.channel) {
            return interaction.followUp({ content: 'You are not in a voice channel!'});
        }
        if (!player) return interaction.followUp({ content: 'Nothing is playing!'});

        try {
            await player.queue.clear();
            stopEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`The queue has been cleared by${interaction.user.displayName}`)
            await interaction.followUp({ embeds: [stopEmbed]});
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.log(error);
        }
    }
}
