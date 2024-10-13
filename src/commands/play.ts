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
                .setName('song')
                .setDescription('Music link or search query')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('source')
                .setDescription('Select music source')
                .setRequired(false)
                .addChoices(
                    { name: 'SoundCloud', value: 'soundcloud' },
                    { name: 'Youtube', value: 'youtube' },
                    { name: 'Youtube Music', value: 'youtube_music' },
                )),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        const query = interaction.options.getString('song', true);
        const source = interaction.options.getString('source');

        const kazagumo = bot.manager;
        const member = interaction.member as GuildMember;
        const { channel } = member.voice;

        if (!channel) return interaction.followUp("You need to be in a voice channel to use this command.");

        let player = kazagumo.players.get(interaction.guildId!);

        if (player && player.voiceId !== channel.id) {
            // Bot is in a different voice channel
            await interaction.followUp(`I'm already in a different voice channel. Please join <#${player.voiceId}> or disconnect me first.`);
            return;
        }

        if (!player) {
            player = await kazagumo.createPlayer({
                guildId: interaction.guildId!,
                textId: interaction.channelId!,
                voiceId: channel.id,
                volume: 100,
                deaf: true,
            });
        }

        let result;
        if (source) {
            result = await kazagumo.search(query, { requester: interaction.member!, engine: source });
        } else {
            result = await kazagumo.search(query, { requester: interaction.member! });
        }

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
