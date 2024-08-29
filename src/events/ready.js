const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');
        await pickPresence();

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
    },
};
