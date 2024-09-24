const { ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');

const primaryButton = new ButtonKit()
    .setCustomId('asa-restart-cluster')
    .setLabel('Restart Cluster')
    .setDisabled(true)
    .setStyle(ButtonStyle.Success);

const secondaryButton = new ButtonKit()
    .setCustomId('asa-stop-cluster')
    .setLabel('Stop Cluster')
    .setDisabled(true)
    .setStyle(ButtonStyle.Secondary);

const row = new ActionRowBuilder()
    .addComponents(primaryButton, secondaryButton);

module.exports = { row }