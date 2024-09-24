// noinspection JSUnresolvedReference,JSCheckFunctionSignatures

const { createClusterCommandEmbed, createClusterCommandUpdateEmbed } = require('../../../../services/event-embeds/event-status/embeds');
const { getServices } = require('../../../../services/requests/getServices');
const { row } = require('../../../../services/event-embeds/event-status/buttons')
const { Events, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { db } = require('../../../../script');
const { default: axios } = require('axios');
const { ButtonKit } = require('commandkit');
const { createMissingRoleEmbed } = require('../../../../services/command-embeds/command-player/embeds');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton()) {

            if (interaction.customId === 'asa-cluster-command') {

                let hasRole = false;
                await interaction.guild.roles.fetch().then(async roles => {
                    const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
                    if (interaction.member.roles.cache.has(role.id)) hasRole = true;
                });

                if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

                await interaction.deferReply();

                const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

                let pendingGameservers = 0;
                await Promise.all(Object.values(reference.nitrado)?.map(async token => {
                    const services = await getServices(token);

                    pendingGameservers = services.length;
                }));

                const primaryButton = new ButtonKit()
                    .setCustomId('asa-restart-cluster')
                    .setLabel('Restart Cluster')
                    .setStyle(ButtonStyle.Success);

                const secondaryButton = new ButtonKit()
                    .setCustomId('asa-stop-cluster')
                    .setLabel('Stop Cluster')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder()
                    .addComponents(primaryButton, secondaryButton);

                await interaction.followUp({ embeds: [await createClusterCommandEmbed(pendingGameservers)], components: [row] });
            }

            if (interaction.customId === 'asa-restart-cluster') {

                let hasRole = false;
                await interaction.guild.roles.fetch().then(async roles => {
                    const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
                    if (interaction.member.roles.cache.has(role.id)) hasRole = true;
                });

                if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

                const message = await interaction.message;

                const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

                let success = 0;
                await Promise.all(Object.values(reference.nitrado)?.map(async token => {
                    const services = await getServices(token);

                    await Promise.all(services.map(async service => {
                        const url = `https://api.nitrado.net/services/${service}/gameservers/restart`;
                        const response = await axios.post(url, {}, { headers: { 'Authorization': token } });

                        response.status === 200 && success++;
                    }));
                }));

                await message.edit({ embeds: [await createClusterCommandUpdateEmbed(success)], components: [row] })
                    .then(async () => await interaction.reply({ content: 'Data Fetch Success - API Online', ephemeral: true } ));
            }

            if (interaction.customId === 'asa-stop-cluster') {

                let hasRole = false;
                await interaction.guild.roles.fetch().then(async roles => {
                    const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
                    if (interaction.member.roles.cache.has(role.id)) hasRole = true;
                });

                if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

                const message = await interaction.message;

                const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

                let success = 0;
                await Promise.all(Object.values(reference.nitrado)?.map(async token => {
                    const services = await getServices(token);

                    await Promise.all(services.map(async service => {
                        const url = `https://api.nitrado.net/services/${service}/gameservers/stop`;
                        const response = await axios.post(url, {}, { headers: { 'Authorization': token } });

                        response.status === 200 && success++;
                    }));
                }));

                await message.edit({ embeds: [await createClusterCommandUpdateEmbed(success)], components: [row] })
                    .then(async () => await interaction.reply({ content: 'Data Fetch Success - API Online', ephemeral: true } ));
            }
        }
    });
};