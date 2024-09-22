// noinspection JSCheckFunctionSignatures

const { EmbedBuilder } = require('discord.js');

const createPlayerSearchEmbed = async (success, totalGameservers, output) => {
    return new EmbedBuilder()
        .setDescription(`**Search Command Success**\nMatches will be displayed below.\nExecuted on \`${success}\` of \`${totalGameservers}\` servers.\n\n${output}`)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0x2ecc71);
}

module.exports = { createPlayerSearchEmbed };