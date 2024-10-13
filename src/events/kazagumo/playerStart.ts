import {Events, KazagumoPlayer, KazagumoTrack} from 'kazagumo';
import {ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, Message, TextChannel, VoiceChannel} from "discord.js";
import {bot} from "../../index";


export default {
    name: Events.PlayerStart,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        const trackRequester = track.requester as GuildMember;
        const voiceChannel = bot.client.channels.cache.get(player.voiceId!) as VoiceChannel;
        const textChannel = bot.client.channels.cache.get(player.textId!) as TextChannel;

        const platformEmojis = {
            youtube: bot.client.emojis.cache.find(emoji => emoji.name === "youtube"),
            spotify: bot.client.emojis.cache.find(emoji => emoji.name === "spotify"),
            soundcloud: bot.client.emojis.cache.find(emoji => emoji.name === "soundcloud"),
        } as const;

        const platformColors = {
            youtube: 0xff0000,
            spotify: 0x1DB954,
            soundcloud: 0xFF5500,
            default: 0x00ff00,
        } as const;

        const buttonEmojis = {
            stop: bot.client.emojis.cache.find(emoji => emoji.name === "stopButton"),
            skip: bot.client.emojis.cache.find(emoji => emoji.name === "skipButton"),
            back: bot.client.emojis.cache.find(emoji => emoji.name === "lasttrackButton"),
            playpause: bot.client.emojis.cache.find(emoji => emoji.name === "playpauseButton"),
            loop: bot.client.emojis.cache.find(emoji => emoji.name === "loopButton"),
        } as const;

        type Platform = keyof typeof platformEmojis;
        const platform: Platform = (track.sourceName in platformEmojis ? track.sourceName : 'default') as Platform;

        const emoji = platformEmojis[platform] || '🎵';
        const color = platformColors[platform];

        const playingEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${emoji} Now Playing: ${track.title}`)
            .setURL(track.realUri!)
            .addFields(
                { name: '🎤 Artist', value: `${track.author}`, inline: true },
                { name: '🎧 Requested by', value: `${trackRequester}`, inline: true },
                { name: '⏱️ Duration', value: `${formatTime(track.length as number)}`, inline: true },
                { name: '📅 Started at', value: `${new Date().toLocaleTimeString('pl-PL', { timeZone: 'Europe/Warsaw' })}`, inline: true }
            )
            .setImage(track.thumbnail!)
            .setFooter({
                text: `Now playing in ${voiceChannel.name}`,
                iconURL: 'https://cdn-icons-png.flaticon.com/512/4472/4472584.png',
            });


		const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('stop')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${buttonEmojis["stop"]}`)
                )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('back')
                .setEmoji(`${buttonEmojis["back"]}`)
                .setStyle(ButtonStyle.Secondary))
            .addComponents(
                new ButtonBuilder()
                .setCustomId('pauseresu')
                .setEmoji(`${buttonEmojis["playpause"]}`)
                .setStyle(ButtonStyle.Secondary))
            .addComponents(
                new ButtonBuilder()
                .setCustomId('skip')
                .setEmoji(`${buttonEmojis["skip"]}`)
                .setStyle(ButtonStyle.Secondary))
            .addComponents(
                new ButtonBuilder()
                .setCustomId('loop')
                .setEmoji(`${buttonEmojis["loop"]}`)
                .setStyle(ButtonStyle.Secondary))

        try {
            const lastMessage = player.data.get("message") as Message;
            if (lastMessage){
                await lastMessage.delete();
            }
            const message = await textChannel.send({embeds: [playingEmbed],components: [row]});
            player.data.set('message', message);
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