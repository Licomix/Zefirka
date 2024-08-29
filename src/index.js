const { Client, GatewayIntentBits, EmbedBuilder, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const { Connectors } = require("shoukaku");
const { Kazagumo } = require("kazagumo");

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    ]
});

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

const Nodes = [
    {
        name: 'owo', // Not necessarily
        url: 'lavalink:2333', // ip address : port
        auth: 'youshallnotpass', // Password auth
        secure: false, // Secure server
    }
];

const kazagumo = new Kazagumo(
{
    defaultSearchEngine: "soundcloud",
    defaultYoutubeThumbnail: "mqdefault",
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
}, new Connectors.DiscordJS(client), Nodes);

kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
kazagumo.shoukaku.on('debug', (name, info) => console.debug(`Lavalink ${name}: Debug,`, info));
kazagumo.shoukaku.on('disconnect', (name, count) => {
    const players = [...kazagumo.shoukaku.players.values()].filter(p => p.node.name === name);
    players.map(player => {
        kazagumo.destroyPlayer(player.guildId);
        player.destroy();
    });
    console.warn(`Lavalink ${name}: Disconnected`);
});

kazagumo.on("playerStart", (player, track) => {
    const isPlayingEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Now Playing`)
        .setDescription(`${track.author} - ${track.title}`)
        .setImage(track.thumbnail)
        .setFooter({ text: `By ${track.requester}, duration ${formatTime(track.length)}`, iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/1200px-Apple_Music_icon.svg.png"});
    client.channels.cache.get(player.textId)?.send({embeds: [isPlayingEmbed] })
        .then(x => player.data.set("message", x));

    client.user.setActivity({
        name: `${track.author} - ${track.title}`,
        type: ActivityType.Listening,
    });
});

kazagumo.on('playerEnd', async (player) => {
    setTimeout(async () => {
        if (!player) return;

        const voiceChannel = client.channels.cache.get(player.voiceId);
        if (voiceChannel.members.size === 1) {
            await player.destroy();

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('I left the voice channel because there were no participants.');

            const textChannel = client.channels.cache.get(player.textId);
            if (textChannel) await textChannel.send({ embeds: [embed] });
        }
    }, 60000);

    await pickPresence();
});

kazagumo.on('playerEmpty', async (player) => {
    if (!player.queue.length) {
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription('The queue is finished.');

        const channel = client.channels.cache.get(player.textId);
        if (channel) await channel.send({ embeds: [embed] });
        setTimeout(async () => {
            if (!player.queue.length) {
                await player.destroy();

                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription('I left the voice channel due to a lack of activity');

                const textChannel = client.channels.cache.get(player.textId);
                if (textChannel) await textChannel.send({ embeds: [embed] });
            }
        }, 60000);
    }
    await pickPresence();
});

kazagumo.on('playerError', (player, error) => {
    console.log(`Player error in guild ${player.guildId}, error: ${error}`);
});

kazagumo.on('playerResolveError', (player, track, error) => {
    console.log(`Resolve error for track ${track.title} in guild ${player.guildId}, error: ${error}`);
});

function formatTime(milliseconds) {
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

async function pickPresence () {
    try {
        await client.user.setPresence({
            activities: [
                {
                    name: "Enjoying a life of serenity",
                    type: ActivityType.Listening,
                },
            ],
            status: 'online',
        })
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.kazagumo = kazagumo;
    await client.login(process.env.token)
})();