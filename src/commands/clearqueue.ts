import {CommandInteraction, EmbedBuilder, GuildMember, InteractionContextType, SlashCommandBuilder} from "discord.js";
import { bot } from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('Clear queue')
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        if (!player) return interaction.followUp({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });

        try {
            player.queue.clear();
            const stopEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription(`The queue has been cleared by ${interaction.user.displayName}`)
            await interaction.followUp({ embeds: [stopEmbed]});
        } catch (error) {
            await interaction.followUp("Oops, something went wrong. Please try again.");
            console.log(error);
        }
    }
}