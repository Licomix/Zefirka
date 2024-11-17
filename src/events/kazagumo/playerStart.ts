import {Events, KazagumoPlayer, KazagumoTrack} from 'kazagumo';
import {ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonStyle, DiscordjsError, EmbedBuilder, GuildMember, Message, TextChannel, VoiceChannel} from "discord.js";
import {bot} from "../../index";


export default {
    name: Events.PlayerStart,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        const trackRequester = track.requester as GuildMember;
        const voiceChannel = bot.client.channels.cache.get(player.voiceId!) as VoiceChannel;
        const textChannel = bot.client.channels.cache.get(player.textId!) as TextChannel;

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

        const defaultButtonEmojis = {
            stop: '⏹️',
            skip: '⏭️',
            back: '⏮️',
            playpause: '⏯️',
            loop: '🔁',
        };

        // Uncomment and put your own emojis
        const customButtonEmojis = {
            // stop: '<:stopButton:1116616280120770620>',
            // skip: '<:skipButton:1116616266472501248>',
            // back: '<:lasttrackButton:1116616252799070238>',
            // playpause: '<:playpauseButton:1116616237544382474>',
            // loop: '<:loopButton:1116616290862370878>'
        }

        const buttonEmojis = {
            ...defaultButtonEmojis,
            ...customButtonEmojis,
        }

        type Platform = keyof typeof platformIcons;
        const platform: Platform = (track.sourceName in platformIcons ? track.sourceName : 'default') as Platform;

        const color = platformColors[platform as keyof typeof platformColors] || platformColors.default;
        const icon = platformIcons[platform];

        const playingEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Now Playing', iconURL: icon })
            .setColor(color)
            .setDescription(`## [${track.title}](${track.realUri!})`)
            .addFields(
                { name: '🎤 Artist', value: `\` ${track.author} \``, inline: true },
                { name: '🎧 Requested by', value: `${trackRequester}`, inline: true },
                { name: '⏱️ Duration', value: `\` ${formatTime(track.length as number)} \``, inline: true }
            )
            .setImage(track.thumbnail!)
            .setFooter({
                text: `Channel: ${voiceChannel.name} | Queue Length: ${player.queue.length}`,
                iconURL: bot.client.user?.displayAvatarURL() || undefined,
            });


		const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('stop')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(buttonEmojis.stop),
                new ButtonBuilder()
                .setCustomId('back')
                .setEmoji(buttonEmojis.back)
                .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                .setCustomId('pauseresu')
                .setEmoji(buttonEmojis.playpause)
                .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                .setCustomId('skip')
                .setEmoji(buttonEmojis.skip)
                .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                .setCustomId('loop')
                .setEmoji(buttonEmojis.loop)
                .setStyle(ButtonStyle.Secondary)
            );

        try {
            const newMessage = await textChannel.send({embeds: [playingEmbed], components: [row]});
            player.data.set('message', newMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        bot.client.user?.setActivity({
            name: `${track.author} - ${track.title}`,
            type: 2, // Listening
        });
    }
}

function formatTime(milliseconds: number): string {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    minutes = minutes % 60;
    seconds = seconds % 60;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}
