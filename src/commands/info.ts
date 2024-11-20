import {CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder} from "discord.js";
import {bot} from "../index";
import {KazagumoPlayer} from "kazagumo";


export default {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Information about now playing track"),

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

        if (!player.queue) return interaction.followUp({ content: 'Nothing is playing!' });

        const currentTrack = player.queue.current;

        const platformColors = {
            youtube: 0xff0000,
            spotify: 0x1DB954,
            soundcloud: 0xFF5500,
            applemusic: 0xFB015B,
            deezer:0xFF5E3A,
            jiosaavn:0x008A78,
            default: 0x00ff00,
        } as const;

        const platformIcons = {
            youtube: 'https://i.imgur.com/xzVHhFY.png',
            spotify: 'https://i.imgur.com/qvdqtsc.png',
            soundcloud: 'https://i.imgur.com/MVnJ7mj.png',
            applemusic: 'https://i.imgur.com/Wi0oyYm.png',
            deezer: 'https://i.imgur.com/xyZ43FG.png',
            jiosaavn: 'https://i.imgur.com/N9Nt80h.png',
            default: 'https://thumbs2.imgbox.com/4f/9c/adRv6TPw_t.png'
        } as const;

        type Platform = keyof typeof platformIcons;
        const platform: Platform = (currentTrack!.sourceName in platformIcons ? currentTrack!.sourceName : 'default') as Platform;

        const color = platformColors[platform as keyof typeof platformColors] || platformColors.default;
        const icon = platformIcons[platform];

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ name: 'Current Track', iconURL: icon })
            .addFields(
                { name: '🎤 Artist', value: `\` ${currentTrack!.author} \``, inline: true },
                { name: '🎧 Requested by', value: `${currentTrack?.requester}`, inline: true },
            )
            .setDescription(`## [${currentTrack!.title}](${currentTrack!.realUri!})\n\n${createProgressBar(player)}`)
            .setImage(currentTrack!.thumbnail!)
            .setFooter({
                text: `Channel: ${voiceChannel.name} | Queue Length: ${player.queue.length}`,
                iconURL: bot.client.user?.displayAvatarURL() || undefined,
            });

        await interaction.followUp({ embeds: [embed] });
    }
};

// Credits for https://github.com/Androz2091/discord-player/blob/0441e01d/packages/discord-player/src/manager/GuildQueuePlayerNode.ts#L193
interface ProgressBarOptions {
    indicator?: string;
    leftChar?: string;
    rightChar?: string;
    length?: number;
    timecodes?: boolean;
    separator?: string;
}

function createProgressBar(player: KazagumoPlayer | undefined, options: ProgressBarOptions = {}): string | null {
    const track = player!.queue.current; // Текущий трек
    if (!track) return null;

    const currentTime = player!.position ?? 0; // Текущее время воспроизведения
    const totalTime = track.length ?? 0; // Длительность трека

    if (isNaN(currentTime) || isNaN(totalTime)) return null;

    const {
        indicator = '\u{1F518}',
        leftChar = '\u25AC',
        rightChar = '\u25AC',
        length = 15,
        timecodes = true,
        separator = '\u2503',
    } = options;

    if (isNaN(length) || length < 0 || !Number.isFinite(length)) {
        throw new Error(`Invalid length: expected a finite number >= 0, got ${length}`);
    }

    const index = Math.round((currentTime / totalTime) * length);
    const bar = index >= 1 && index <= length
        ? leftChar.repeat(index - 1) + indicator + rightChar.repeat(length - index)
        : indicator + rightChar.repeat(length - 1);

    if (timecodes) {
        const formatTime = (ms: number) =>
            new Date(ms).toISOString().substr(11, 8).replace(/^00:/, ''); // Форматирует время
        return `${formatTime(currentTime)} ${separator} ${bar} ${separator} ${formatTime(totalTime)}`;
    } else {
        return bar;
    }
}


