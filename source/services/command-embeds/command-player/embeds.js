// noinspection JSCheckFunctionSignatures

const { EmbedBuilder } = require('discord.js');

const createPlayerManagementEmbed = async (success, services, token) => {
    return new EmbedBuilder()
        .setDescription(`**Ark Survival Ascended**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${services.length}\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setThumbnail('https://i.imgur.com/CzGfRzv.png')
        .setColor(0x2ecc71);
}





module.exports = { createPlayerManagementEmbed };