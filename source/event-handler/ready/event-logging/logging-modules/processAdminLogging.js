// noinspection EqualityComparisonWithCoercionJS

const { createLoggingParseEmbed } = require('../../../../services/event-embeds/event-logging/embeds')

const processAdminLogging = (client, admin, service_id, response) => {
    const logPattern = /^AdminCmd: (?<command>[a-zA-Z0-9_-]+) \(PlayerName: (?<playerName>[a-zA-Z0-9_-]+), ARKID: (?<arkId>\d+), SteamID: (?<steamId>[a-f0-9]+)\)$/gm;

    let match;
    const loggingData = [];

    let output = '';
    let counter = 0;
    while ((match = logPattern.exec(response)) !== null) {
        const { command, playerName, arkId, steamId } = match.groups;
        loggingData.push({ command, playerName, arkId, steamId });
    }

    loggingData.forEach((log) => {
        output += `**Logging Identity Information**\n[${log.arkId}]: ${log.playerName}\n${log.command}\n\n`;
        counter++;
    });

    if (counter > 50 || counter === 0) return
    Object.entries(admin).forEach(async ([key, value]) => {

        if (service_id == key) {
            try {
                const channel = await client.channels.fetch(value);
                await channel.send({ embeds: [await createLoggingParseEmbed(output)]})

            } catch (error) {
                if (error.code === 50006) console.log('Unable to send empty message.');
                if (error.code === 10003) console.log('Unable to fetch log channel.');
            }
        }
    })
}

module.exports = { processAdminLogging };