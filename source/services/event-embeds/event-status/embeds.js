const { EmbedBuilder } = require('discord.js');

const createStatusUpdateEmbed = async (output, overallCurrent, overallMax) => {
    return new EmbedBuilder()
        .setDescription(`${output}**Cluster Player Count**\n \`🌐\` \`(${overallCurrent}/${overallMax})\`\n\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setImage('https://i.imgur.com/bFyqkUS.png')
        .setColor(0x2ecc71);
}

module.exports = { createStatusUpdateEmbed };