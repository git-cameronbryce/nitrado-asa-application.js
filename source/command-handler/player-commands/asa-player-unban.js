// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

const { createPlayerManagementEmbed, createMissingRoleEmbed } = require('../../services/command-embeds/command-player/embeds');
const { getGameservers } = require('../../services/requests/getGameservers');
const { getServices } = require('../../services/requests/getServices');
const { SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');
const { db } = require('../../script');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asa-player-unban')
        .setDescription('Performs an in-game player action.')
        .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true)),

    run: async ({ interaction }) => {

        let hasRole = false;
        await interaction.guild.roles.fetch().then(async roles => {
            const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
            if (interaction.member.roles.cache.has(role.id)) hasRole = true;
        });

        if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

        await interaction.deferReply();

        const input = {
            username: interaction.options.getString('username'),
            admin: interaction.user.id
        };

        const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

        const { audits: { player = null } = {} } = reference || {};
        Object.values(reference.nitrado)?.map(async token => {
            const services = await getServices(token);

            let success = 0;
            await Promise.all(services.map(async service => {
                const gameservers = await getGameservers(token, service);

                const { gameserver: { ip, rcon_port, settings: { config } } } = gameservers;

                await new Promise(async (resolve) => {
                    setTimeout(() => resolve(), 1250);
                    try {
                        const rcon = await Rcon.connect({
                            host: ip, port: rcon_port, password: config['current-admin-password'],
                        });

                        const response = await rcon.send(`UnbanPlayer ${input.username}`);
                        response.trim() === `${input.username} Unbanned` && success++;

                    } catch (error) {
                        if (error.code === 'ECONNRESET') console.log('Unable to establish connection.');
                        if (error.code === 'ETIMEDOUT') console.log('Unable to establish connection.');
                    }

                }).catch(error => { console.log(error); });
            }));

            await interaction.followUp({ embeds: [await createPlayerManagementEmbed(success, services, token)] });
        })
    },

    options: {},
};
