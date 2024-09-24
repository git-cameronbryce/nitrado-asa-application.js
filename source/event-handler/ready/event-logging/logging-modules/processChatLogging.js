// noinspection EqualityComparisonWithCoercionJS

const { createLoggingParseEmbed } = require('../../../../services/event-embeds/event-logging/embeds')

const processChatLogging = (client, chat, service_id, response) => {
    const logPattern = /^(?<steamName>[a-zA-Z0-9_-]+) \((?<inGameName>[^)]+)\): (?<message>.+)$/gm;

    let match;
    const loggingData = [];

    let output = '';
    let counter = 0;
    while ((match = logPattern.exec(response.trim())) !== null) {
        const { steamName, inGameName, message } = match.groups;
        loggingData.push({ steamName, inGameName, message });
    }

    loggingData.forEach((log) => {
        output += `**Logging Identity Information**\n[${log.steamName}]: ${log.inGameName}\n${log.message}\n\n`;
        counter++;
    });

    if (counter > 50 || counter === 0) return
    Object.entries(chat).forEach(async ([key, value]) => {

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

    console.log(loggingData); // Moved inside the function
};

module.exports = { processChatLogging };
