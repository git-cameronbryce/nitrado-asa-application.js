// noinspection JSCheckFunctionSignatures

const { EmbedBuilder } = require('discord.js');

const createLoggingThreadDuplicateEmbed = async () => {
    return new EmbedBuilder()
        .setDescription("**Duplicate Gameserver Detected**\nGameserver data stored in database.\nLogging is currently being captured. \n\n**Additional Information**\nLogs can take upwards of 5m to update.\nEnsure your server has logging enabled.")
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0xe67e22);
}

const createLoggingCreationEmbed = async () => {
    return new EmbedBuilder()
        .setDescription(`**Action Authorization Granted**\nGameserver has been stored in database.\nRequested thread will now be generated.\n\`🔐\` \`Command Executed: Locked\`\n\n**Additional Information**\nLogs can take upwards of 5m to update.\nEnsure your server has logging enabled.`)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0x2ecc71)
}

const createLoggingThreadEmbed = async (service_id) => {
    return new EmbedBuilder()
        .setDescription(`**Logging System Information**\nInformation is initialized in our database.\nProceeding with the setup process.\n\n**Collected Information**\nServer Identification: \`${service_id}\``)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0x2ecc71)
}

const createLoggingQueryEmbed = async () => {
    return new EmbedBuilder()
        .setDescription(`**Unable To Establish Connection**\nGameserver data not able to be obtained.\nEnsure your server is in a join-able state.\n\n**Additional Information**\nSuggested to restart attempted server.\nConnection required to obtain data.`)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0xe67e22)
}

const createLoggingOnlineEmbed = async (output) => {
    return new EmbedBuilder()
        .setDescription(`${output}System is watching for gameservers.\nMonitoring \`1\` of \`1\` gameservers.\n<t:${Math.floor(Date.now() / 1000)}:R>`)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0x2ecc71)
}

const createLoggingParseEmbed = async (output) => {
    return new EmbedBuilder()
        .setDescription(`${output}`)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0x2ecc71)
}

module.exports = {
    createLoggingThreadDuplicateEmbed,
    createLoggingCreationEmbed,
    createLoggingOnlineEmbed,
    createLoggingThreadEmbed,
    createLoggingQueryEmbed,
    createLoggingParseEmbed,
};