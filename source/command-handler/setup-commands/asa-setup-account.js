// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asa-setup-account')
        .setDescription('Follow the onboarding process to initialize your account.'),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const primaryButton = new ButtonKit()
            .setCustomId('asa-setup-token')
            .setLabel('Setup Token')
            .setStyle(ButtonStyle.Success);

        const secondaryButton = new ButtonKit()
            .setURL('https://discord.gg/tGNNVRFS')
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
            .addComponents(primaryButton, secondaryButton);

        const embed = new EmbedBuilder()
            .setDescription("**Ark Survival Ascended**\n**Cluster Setup & Overview**\nThank you for choosing our service. Below, you'll have the option to link your token, along with a [video preview](https://imgur.com/a3b9GkZ) to display the process.\n\n**Additional Information**\nEnsure this guild is a [community](https://i.imgur.com/q8ElPKj.mp4) server, otherwise, the bot will not be able to integrate properly.\n\n**[Partnership & Affiliation](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will receive partial commission!")
            .setFooter({ text: 'Note: Contact support if issues persist.' })
            .setImage('https://i.imgur.com/bFyqkUS.png')
            .setColor(0x2ecc71);

        await interaction.followUp({ embeds: [embed], components: [row] });
    },

    options: {},
};
