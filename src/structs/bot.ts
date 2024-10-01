import {ApplicationCommandDataResolvable, Collection, Events, Interaction, REST, Routes} from "discord.js";
import {readdirSync} from "fs";
import {join} from "path";
import {Command} from "../interfaces/command";
import "dotenv/config";
import {Connectors} from "shoukaku";
import {Kazagumo} from "kazagumo";
import {kazagumoNode} from "../../config/lavalink";
import {shoukakuOption} from "../../config/playback"
import {CustomClient} from "../interfaces/client";


export class Bot {
    public readonly prefix = "/";
    public commands = new Collection<string, Command>();
    public slashCommands = new Array<ApplicationCommandDataResolvable>();
    public slashCommandsMap = new Collection<string, Command>();
    public manager: Kazagumo;
    private readonly token: string;


    public constructor(public readonly client: CustomClient) {
        if (!process.env.TOKEN) {
            throw new Error("No token provided");
        } else {
            this.token = process.env.TOKEN;
        }

        this.manager = new Kazagumo({
            defaultSearchEngine: "soundcloud",
            send: (guildId, payload) => {
                const guild = this.client.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            }
        }, new Connectors.DiscordJS(this.client), kazagumoNode, shoukakuOption);

        this.client.login(this.token);

        this.client.on("ready", () => {
            console.log(`${this.client.user!.username} ready!`);

            this.registerSlashCommands();
            this.registerKazagumoEvents();
            this.registerDiscordEvents()
            this.pickDefaultPresence();
        });

        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);
    }

    // Private function for registering slash commands
    private async registerSlashCommands() {
        const rest = new REST({version: "9"}).setToken(this.token);

        const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter((file) => !file.endsWith(".map"));

        for (const file of commandFiles) {
            const command = await import(join(__dirname, "..", "commands", `${file}`));

            this.slashCommands.push(command.default.data);
            this.slashCommandsMap.set(command.default.data.name, command.default);
        }

        await rest.put(Routes.applicationCommands(this.client.user!.id), {body: this.slashCommands});
    }

    // Private function for register Kazagumo events
    private async registerKazagumoEvents() {
        const eventFiles = readdirSync(join(__dirname, "..", "events/kazagumo")).filter((file) => !file.endsWith(".map"));

        for (const file of eventFiles) {
            try {
                const event = await import(join(__dirname, "..", "events/kazagumo", `${file}`));
                this.manager.on(event.default.name, async (...args) => {
                    event.default.execute(...args);
                });
            } catch (error) {
                console.error(`Error loading event ${file}:`, error);
            }
        }

        this.manager.shoukaku.on('ready', name => console.log(`Lavalink ${name}: Ready!`))
            .on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error))
            .on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`))
            .on('disconnect', (name, count) => {
                const players = [...this.manager.shoukaku.players.values()].filter(p => p.node.name === name);
                players.forEach(player => {
                    this.manager.destroyPlayer(player.guildId);
                    player.destroy();
                });
                console.warn(`Lavalink ${name}: Disconnected`);
            });
    }

    // Private function for register Discord Events
    private async registerDiscordEvents() {
        const eventFiles = readdirSync(join(__dirname, "..", "events/discord")).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
    
        for (const file of eventFiles) {
            try {
                const event = await import(join(__dirname, "..", "events/discord", `${file}`));
    
                if (!event.default || typeof event.default.execute !== 'function') {
                    console.warn(`Event ${file} does not export a valid execute function.`);
                    continue;
                }
    
                this.client.on(event.default.name, async (...args) => {
                    try {
                        await event.default.execute(...args);
                    } catch (error) {
                        console.error(`Error executing event ${event.default.name}:`, error);
                    }
                });
            } catch (error) {
                console.error(`Error loading event ${file}:`, error);
            }
        }
    }

    // Public function for picking default rich presence
    public async pickDefaultPresence() {
        try {
            if (this.client.user) {
                this.client.user.setPresence({
                    activities: [
                        {
                            name: "Enjoying a life of serenity",
                            state: "Enjoying a life of serenity",
                            type: 4, // Custom
                        },
                    ],
                    status: "online",
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
}
