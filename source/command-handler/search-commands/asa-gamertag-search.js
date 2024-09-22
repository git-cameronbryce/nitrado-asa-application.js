// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

const { createPlayerSearchEmbed } = require('../../services/command-embeds/command-search/embeds');
const { getGameservers } = require('../../services/requests/getGameservers');
const { getServices } = require('../../services/requests/getServices');
const { SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');
const { db } = require('../../script');

/*
 Response: "ListPlayers" -> No Players Connected
 0. cameronbryce, 0002e5da43e74cf09f4cf9ec2489eac5
*/

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asa-gamertag-search')
        .setDescription('Performs an in-game search action.')
        .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true)),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const input = {
            username: interaction.options.getString('username'),
        };

        const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

        let output = '';
        let success = 0, totalGameservers = 0;
        await Promise.all(Object.values(reference.nitrado)?.map(async token => {
            const services = await getServices(token);

            let playerData = [];
            await Promise.all(services.map(async service => {
                const gameservers = await getGameservers(token, service);
                totalGameservers++;

                const { ip, rcon_port, service_id, config } = gameservers;
                console.log(config['current-admin-password'], service, ip);

                await new Promise(async (resolve) => {
                    setTimeout(() => resolve(), 1250);
                    try {
                        const rcon = await Rcon.connect({
                            host: ip, port: rcon_port, password: config['current-admin-password'],
                        });

                        rcon.authenticated && success++;
                        const response = await rcon.send(`ListPlayers`);

                        const regex = /(?<lineItem>\d+)\.\s*(?<username>[a-zA-Z0-9_]+),\s*(?<identifier>[0-9a-f]{32})/g;
                        const results = Array.from(response.matchAll(regex), match => ({
                            lineItem: match.groups.lineItem,
                            username: match.groups.username,
                            identifier: match.groups.identifier,
                            location: `${service_id} - ${ip}:${rcon_port}`,
                        }));

                        console.log(response);
                        if (results.length > 0) { playerData.push(...results); }

                    } catch (error) { if (error.code === 'ETIMEDOUT') console.log('Unable to establish connection.'); }

                }).catch(error => { console.log(error); });
            }));

            console.log(playerData);
            playerData.forEach(player => {
                if (!player.username.includes(input.username)) return;
                output += `\`🟢\` \`Player Online\`\n\`🔗\` ${player.identifier}\n\`🔗\` ${player.location}\n\`🔗\` ${player.username}\n\n`;
            });
        }));

        if (!output.length) output = '**Additional Information**\nCould not locate the searched player.\nEnsure the searched player is online.';
        await interaction.followUp({ embeds: [await createPlayerSearchEmbed(success, totalGameservers, output)] });
    },

    options: {},
};
