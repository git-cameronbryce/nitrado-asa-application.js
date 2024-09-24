const { EmbedBuilder } = require('discord.js');

const createServerManagementInvalidEmbed = async () => {
    return new EmbedBuilder()
        .setDescription(`**Ark Survival Evolved**\n**Game Command Failure**\nGameserver action completed.\nExecuted on \`0\` of \`0\` servers.\n\`\`\`Invalid Identifier\`\`\``)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setThumbnail('https://i.imgur.com/PCD2pG4.png')
        .setColor(0xe67e22);
}

const createServerManagementEmbed = async (token) => {
    return new EmbedBuilder()
        .setDescription(`**Ark Survival Ascended**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`1\` of \`1\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setThumbnail('https://i.imgur.com/CzGfRzv.png')
        .setColor(0x2ecc71);
}

const createServerManagementAuditEmbed = async (input, token) => {
    return new EmbedBuilder()
        .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nExecuting \`1\` of \`1\` servers.\n\n> ||<@${input.admin}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setColor(0x2ecc71);
}

module.exports = { createServerManagementInvalidEmbed, createServerManagementEmbed, createServerManagementAuditEmbed };