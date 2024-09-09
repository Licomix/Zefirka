import {Events, KazagumoPlayer, KazagumoTrack} from 'kazagumo';
import {EmbedBuilder, GuildMember, TextChannel} from "discord.js";
import {bot} from "../index";


export default {
    name: Events.PlayerStart,
    async execute(player: KazagumoPlayer, track: KazagumoTrack) {
        const trackRequester = track.requester as GuildMember;
        console.log(trackRequester.nickname);
        console.log(track.author);
        console.log(track.title);
        console.log(track.length);
        console.log(track.thumbnail);
        console.log(player.textId);


        const isPlayingEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Now Playing')
            .setDescription(`${track.author} - ${track.title}`)
            .setImage(track.thumbnail || 'https://default-thumbnail.png')  // Обработка возможного undefined
            .setFooter({
                text: `By ${trackRequester.nickname}, duration ${formatTime(track.length as number)}`,
                iconURL: 'https://cdn-icons-png.flaticon.com/512/4472/4472584.png',
            });

        const textChannel = bot.client.channels.cache.get(player.textId!) as TextChannel;
        if (textChannel) {
            try {
                const message = await textChannel.send({embeds: [isPlayingEmbed]});
                player.data.set('message', message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.error('Text channel not found');
        }

        bot.client.user?.setActivity({
            name: `${track.author} - ${track.title}`,
            type: 2,

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