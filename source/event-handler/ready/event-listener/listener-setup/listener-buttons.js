// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const { Events, TextInputStyle } = require('discord.js');
const { createMissingRoleEmbed } = require('../../../../services/command-embeds/command-player/embeds');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton())

            if (interaction.customId === 'asa-setup-token') {

                let hasRole = false;
                await interaction.guild.roles.fetch().then(async roles => {
                    const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
                    if (interaction.member.roles.cache.has(role.id)) hasRole = true;
                });

                if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

                const modal = new ModalBuilder()
                .setCustomId('asa-modal-setup')
                .setTitle('Token Integration Process');

            const modalTokenRequired = new TextInputBuilder()
                .setCustomId('asa-nitrado-token-required').setLabel('Required Nitrado Token').setMinLength(25).setMaxLength(100)
                .setPlaceholder('...xMk99ZfXDRtKZDEq24B098-X42zX8kHqo3')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const modalTokenOptional = new TextInputBuilder()
                .setCustomId('asa-nitrado-token-optional').setLabel('Optional Nitrado Token').setMinLength(25).setMaxLength(100)
                .setPlaceholder('...oAg66TcQYUnYXBQn17A161-N86cN5jWDp7')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const modalRequiredParameter = new ActionRowBuilder()
                .addComponents(modalTokenRequired);

            const modalOptionalParameter = new ActionRowBuilder()
                .addComponents(modalTokenOptional);

            modal.addComponents(modalRequiredParameter, modalOptionalParameter);
            await interaction.showModal(modal);
        }
    })
};