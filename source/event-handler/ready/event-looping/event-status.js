// noinspection JSUnresolvedReference,JSCheckFunctionSignatures

const { db } = require('../../../script.js');
const { getServices } = require('../../../services/requests/getServices');
const { getGameservers } = require('../../../services/requests/getGameservers');
const { createStatusUpdateEmbed } = require('../../../services/event-embeds/event-status/embeds');
const { ButtonKit } = require('commandkit');
const { ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = (client) => {
    const loop = async () => {

        // Array to hold all the server data for sorting
        let serverDataArray = [];

        const ascendingFilterProcess = async (gameservers) => {
            const { gameserver: { status, service_id, query } } = gameservers;

            // Default values if there's an issue with data fetch
            const server = query.server_name || 'Data Fetch Error - API Outage';
            const playersCurrent = query.player_current || 0;
            const playersMax = query.player_max || 0;

            // Add the server data to the array, including status and player counts
            serverDataArray.push({
                server, status, service_id, playersCurrent, playersMax,
            });
        };

        const reference = await db.collection('asa-configuration').get();

        await Promise.all(reference.docs.map(async (doc) => {
            // Extract nitrado and status from Firestore document
            const { nitrado, status } = doc.data();

            await Promise.all(Object.values(nitrado).map(async token => {
                try {
                    const services = await getServices(token);

                    try {
                        await Promise.all(services.map(async service => {
                            const gameservers = await getGameservers(token, service);

                            await ascendingFilterProcess(gameservers);
                        }));

                    } catch (error) { return console.log('Unable to establish connection: getGameservers()') }
                } catch (error) { return console.log('Unable to establish connection: getServices()') }
            }));

            // Sort the serverDataArray by playersCurrent in descending order (highest to lowest)
            serverDataArray.sort((a, b) => b.playersCurrent - a.playersCurrent);

            // Now, construct the output based on the sorted data
            let output = '';

            serverDataArray.forEach(serverData => {
                const { server, status, playersCurrent, playersMax, service_id } = serverData;

                switch (status) {
                    case 'started':
                        output += `\`🟢\` \`Service Online\`\n${server}\nPlayer Count: \`${playersCurrent}/${playersMax}\`\nID: ||${service_id}||\n\n`;
                        break;
                    case 'restarting':
                        output += `\`🟠\` \`Service Restarting\`\n${server}\nPlayer Count: \`${playersCurrent}/${playersMax}\`\nID: ||${service_id}||\n\n`;
                        break;
                    case 'updating':
                        output += `\`🟠\` \`Service Updating\`\n${server}\nPlayer Count: \`${playersCurrent}/${playersMax}\`\nID: ||${service_id}||\n\n`;
                        break;
                    case 'stopping':
                        output += `\`🔴\` \`Service Stopping\`\n${server}\nPlayer Count: \`${playersCurrent}/${playersMax}\`\nID: ||${service_id}||\n\n`;
                        break;
                    case 'stopped':
                        output += `\`🔴\` \`Service Stopped\`\n${server}\nPlayer Count: \`${playersCurrent}/${playersMax}\`\nID: ||${service_id}||\n\n`;
                        break;
                }
            });

            // Calculate overall current and maximum population
            const overallCurrent = serverDataArray.reduce((sum, server) => sum + server.playersCurrent, 0);
            const overallMax = serverDataArray.reduce((sum, server) => sum + server.playersMax, 0);

            // Log the final output
            try {
                const channel = await client.channels.fetch(status.channel);  // Use status to access the channel
                const message = await channel.messages.fetch(status.message); // Use status to access the message

                const primaryButton = new ButtonKit()
                    .setCustomId('asa-cluster-command')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Cluster Command')

                const secondaryButton = new ButtonKit()
                    .setURL('https://discord.gg/tGNNVRFS')
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Support Server');

                const row = new ActionRowBuilder()
                    .addComponents(primaryButton, secondaryButton);

                // Edit the message with the updated embed
                await message.edit({ embeds: [await createStatusUpdateEmbed(output, overallCurrent, overallMax)], components: [row] });

            } catch (error) { console.error('Error fetching or editing message:'); }
        }));

        // Restart the loop after 60 seconds
        setTimeout(loop, 60000);
    };

    loop().then(() => console.log('Status loop started...'));
};
