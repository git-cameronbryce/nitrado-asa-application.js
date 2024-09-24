// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const { Events, TextInputStyle } = require('discord.js');
const { createMissingRoleEmbed } = require('../../../../services/command-embeds/command-player/embeds');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton())

            if (interaction.customId === 'asa-manual-setup') {

            let hasRole = false;
            await interaction.guild.roles.fetch().then(async roles => {
                const role = roles.find(role => role.name === 'AS:A Obelisk Permission');
                if (interaction.member.roles.cache.has(role.id)) hasRole = true;
            });

            if (!hasRole) return await interaction.reply({ embeds: [await createMissingRoleEmbed()], ephemeral: true });

            const modal = new ModalBuilder()
                .setCustomId('asa-modal-manual-setup')
                .setTitle('Gameserver Integration Process');

            const modalTokenRequired = new TextInputBuilder()
                .setCustomId('asa-gameserver-identifier-required').setLabel('Required Gameserver Identifier').setMinLength(8).setMaxLength(8)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const modalRequiredParameter = new ActionRowBuilder()
                .addComponents(modalTokenRequired);

            modal.addComponents(modalRequiredParameter);
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'asa-automatic-setup') {
            await interaction.reply({ content: 'Temporarily disabled. Please use the manual method.\nContact support if you need assistance.', ephemeral: true });
        }
    })
};