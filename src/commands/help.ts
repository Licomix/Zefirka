import { CommandInteraction, SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("About me!"),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const helpEmbed = {
            color: 0xFFFFFF,
            title: 'Hey, you asked for help',
            description: 'I am Zefirka - I play music for you!\nList of my commands:',
            fields: [
                { name: '/help', value: 'Help command' },
                { name: '/play', value: 'Start playing music' },
                { name: '/play-ext', value: 'Start playing music, but you can choose which service you will use' },
                { name: '/stop', value: 'Stops playing music' },
                { name: '/skip', value: 'Skips the current track' },
                { name: '/loop', value: 'Loops playback: track or queue' },
                { name: '/empty', value: 'Clears the queue' },
                { name: '/pauseresu', value: 'Pauses or resumes playback' },
                { name: '/queue', value: 'Shows 10 tracks in the queue' },
                { name: '/shuffle', value: 'Shuffles tracks in the queue' },
                { name: '/volume', value: 'Changes the playback volume' },
            ]
        };

        await interaction.followUp({ embeds: [helpEmbed] });
    }
};