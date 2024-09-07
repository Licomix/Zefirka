const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help with usage."),
    async execute(interaction) {
        await interaction.deferReply();

        const helpEmbed = {
            color: 0xFFFFFF,
            title: 'Hey, you asked for help',
            description: 'I am Zefirka - I play music for you!\nList of my commands:',
            fields: [
                { name: '/help', value: 'Help.' },
                { name: '/play', value: 'Start playing music.' },
                { name: '/stop', value: 'Stops playing music.' },
                { name: '/skip', value: 'Skips the current music.' },
                { name: '/loop', value: 'Loops playback: track or queue.' },
                { name: '/empty', value: 'Clears the queue.' },
                { name: '/pauseresu', value: 'Pauses or resumes playback.' },
                { name: '/queue', value: 'Shows 10 tracks in the queue.' },
                { name: '/shuffle', value: 'Shuffles tracks in the queue' },
                { name: '/volume', value: 'Changes the playback volume.' },
            ]
        };

        await interaction.followUp({ embeds: [helpEmbed] });
    }
}
