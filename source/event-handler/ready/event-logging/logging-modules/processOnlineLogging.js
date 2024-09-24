// noinspection EqualityComparisonWithCoercionJS

const { createLoggingOnlineEmbed } = require('../../../../services/event-embeds/event-logging/embeds');

const processOnlineLogging = (client, online, service_id, response) => {
    const logPattern = /^(?<lineItem>\d+)\. (?<steamName>[^,]+), (?<steamId>[a-f0-9]+)$/gm;

    let match;
    const loggingData = [];

    let output = '';
    let counter = 0;
    const trimmedResponse = response ? response.trim() : null;
    while ((match = logPattern.exec(trimmedResponse)) !== null) {
        const { lineItem, steamName, steamId } = match.groups;
        loggingData.push({ lineItem, steamName, steamId });
    }

    loggingData.forEach((log) => {
        output += `\`🟢\` \`Player Online\`\n\`🔗\` ${log.steamId}\n\`🔗\` ${log.steamName}\n\n`;
        if (counter > 50) return;
        counter++;
    });

    if (counter === 0) output = '**Additional Information**\nCurrently, there are zero players online.\n\n'
    Object.entries(online).forEach(async ([key, value]) => {
        if (service_id == key) {
            try {
                const channel = await client.channels.fetch(value.thread);
                const message = await channel.messages.fetch(value.thread);
                await message.edit({ embeds: [await createLoggingOnlineEmbed(output)] });

            } catch (error) {
                if (error.code === 50006) console.log('Unable to send empty message.');
                if (error.code === 10003) console.log('Unable to fetch log channel.');
            }
        }
    });
}

module.exports = { processOnlineLogging };
