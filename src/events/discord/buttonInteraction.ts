import {Events, GuildMember, Interaction, Message} from "discord.js";
import { bot } from "../..";


export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isButton()) return;

        const kazagumo = bot.manager;
        const player = kazagumo.players.get(interaction.guildId!);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return await interaction.reply({ content: 'You are not in a voice channel!' });

        if (!player) return await interaction.reply({ content: 'Nothing is playing!' });

        const botVoiceChannel = player.voiceId;
        if (voiceChannel.id !== botVoiceChannel) return await interaction.reply({ content: 'I am in a different voice channel!' });

        switch(interaction.customId){
            case 'stop':
                const lastMessage = player.data.get("message") as Message;
                if (lastMessage) {
                    try {
                        await lastMessage.delete();
                    } catch (error) {
                        console.error('Error deleting "Now Playing" message:', error);
                    }
                    player.data.delete("message");
                }
                await player.destroy();
                await interaction.reply({ content: 'Playback stopped. Hope you enjoyed!' });
                break;

            case 'back':
                if (!player.getPrevious()){
                    await interaction.reply({content: 'Nothing happened!'});
                    break;
                }
                player.play(player.getPrevious(true));
                break;

            case 'pauseresu':
                if (player.paused) {
                    player.pause(false);
                    await interaction.reply({ content: 'Playback resumed!' });
                } else {
                    player.pause(true);
                    await interaction.reply({ content: 'Playback paused!' });
                }
                break;

            case 'skip':
                player.skip();
                await interaction.reply({ content: 'Current music skipped!' });
                break;

            case 'loop':
                switch (player.loop) {
                    case 'none':
                        player.setLoop('track');
                        await interaction.reply({ content: `Loop mode set to track` });
                        break;
                    case 'track':
                        player.setLoop('queue');
                        await interaction.reply({ content: `Loop mode set to queue` });
                        break;
                    case 'queue':
                        player.setLoop('none');
                        await interaction.reply({ content: `Loop mode set to none` });
                        break;
                }
        }
    }
}
