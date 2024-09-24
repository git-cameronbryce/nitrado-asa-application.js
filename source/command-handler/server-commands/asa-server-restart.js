// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

const { createServerManagementInvalidEmbed, createServerManagementEmbed, createServerManagementAuditEmbed } = require('../../services/command-embeds/command-server/embeds');
const { createMissingRoleEmbed } = require('../../services/command-embeds/command-player/embeds');
const { getServices } = require('../../services/requests/getServices');
const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { db } = require('../../script');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asa-server-restart')
        .setDescription('Performs an in-game server action.')
        .addStringOption(option => option.setName('identifier').setDescription('Selected action will be performed on given identifier.').setRequired(true)),

    run: async ({ interaction, client }) => {

        let hasRole = false;
        await interaction.guild.roles.fetch().then(async roles => {
            const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
            if (interaction.member.roles.cache.has(role.id)) hasRole = true;
        });

        if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

        await interaction.deferReply();

        const input = {
            identifier: interaction.options.getString('identifier'),
            admin: interaction.user.id,
        };

        const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

        let pendingGameserver = false;
        const { audits: { server = null } = {} } = reference || {};
        await Promise.all(Object.values(reference.nitrado)?.map(async token => {
            const services = await getServices(token);

            await Promise.all(services.map(async service => {

                // noinspection EqualityComparisonWithCoercionJS
                if (input.identifier != service) return;

                const url = `https://api.nitrado.net/services/${input.identifier}/gameservers/restart`;
                const response = await axios.post(url, {}, { headers: { 'Authorization': token} } );

                if (response.status === 200) pendingGameserver = true;
                await interaction.followUp({ embeds: [await createServerManagementEmbed(token)] });

                try {
                    const channel = await client.channels.fetch(server.channel);
                    await channel.send({ embeds: [await createServerManagementAuditEmbed(input, token)] })

                } catch (error) { if (error.code === 10003) console.log('Unable to send audit information.'); }
            }));
        }));


        if (pendingGameserver === false) {
            await interaction.followUp({ embeds: [await createServerManagementInvalidEmbed()] });
        }
    },

    options: {},
};
