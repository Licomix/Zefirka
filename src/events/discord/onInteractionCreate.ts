import { Events, Interaction } from "discord.js";
import { bot } from "../..";


export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

            const command = bot.slashCommandsMap.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, bot.client);
            } catch (error: any) {
                console.error(error);
                await interaction.followUp({
                    content: 'An unknown error occurred while executing the command!',
                    ephemeral: true,
                });
            }
    }
}