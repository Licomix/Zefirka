import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder,
    InteractionContextType,
} from "discord.js";
import { bot } from "../index"


export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays music from your favorite platforms!")
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Music link')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        const query = interaction.options.getString('url', true);

        const kazagumo = bot.manager;
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.followUp({ content: 'You are not in a voice channel!' });

        const playerData = new Map<string, any>();

        let player = await kazagumo.createPlayer({
            guildId: interaction.guildId!,
            textId: interaction.channelId!,
            voiceId: voiceChannel.id,
            volume: 100,
            deaf: true,
            data: playerData
        });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return interaction.followUp({ content: 'I am in a different voice channel!' });


        let result = await kazagumo.search(query, { requester: interaction.member! });

        if (!result.tracks.length) {
            return interaction.followUp("Sorry, nothing found.");
        }

        if (result.type === "PLAYLIST") {
            for (let track of result.tracks) {
                player.queue.add(track);
            }
        } else {
            player.queue.add(result.tracks[0]);
        }

        if (!player.playing && !player.paused) {
            await player.play();
        }

        const loadingEmbed = {
            color: 0xA020F0,
            description: result.type === "PLAYLIST"
                ? `**Added to queue:** ${result.playlistName}.`
                : `**Added to queue:** ${result.tracks[0].title}.`
        };

        await interaction.followUp({ embeds: [loadingEmbed] });
    }
};
