// noinspection JSCheckFunctionSignatures,JSUnresolvedReference,SpellCheckingInspection

const { createStatusSetupEmbed, createDonationEmbed, createLoggingEmbed } = require('../../../../services/event-embeds/event-listener/embeds');
const { Events, ButtonStyle, ChannelType, ActionRowBuilder, EmbedBuilder} = require('discord.js');
const { FieldValue } = require('firebase-admin/firestore');
const { db } = require('../../../../script');
const { ButtonKit } = require('commandkit');
const { default: axios } = require('axios');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'asa-modal-setup') {
                await interaction.deferReply({ ephemeral: true })

                const roles = await interaction.guild.roles.fetch();
                const action = roles.map(async role => role.name === 'AS:A Obelisk Permission' ? await role.delete() : null);
                try { await Promise.all(action) } catch (error) { return await interaction.followUp({ content: 'In your settings, move the bot role higher.' }) }

                if (!interaction.guild.features.includes('COMMUNITY')) {
                    return await interaction.followUp({ content: 'Setup failure, ensure you set your server to community.' })
                }

                const input = { guild: interaction.guild.id };

                const requiredToken = interaction.fields.getTextInputValue('asa-nitrado-token-required');
                const optionalToken = interaction.fields.getTextInputValue('asa-nitrado-token-optional');

                if (requiredToken === optionalToken) return await interaction.followUp({ content: 'Setup failure, ensure you do not have duplicate token inputs.' })

                const url = 'https://oauth.nitrado.net/token';

                try {
                    const responses = await Promise.all([
                        requiredToken ? axios.get(url, { headers: { 'Authorization': requiredToken } }) : Promise.resolve(null),
                        optionalToken ? axios.get(url, { headers: { 'Authorization': optionalToken } }) : Promise.resolve(null)
                    ]).catch(error => error.response.data.message === 'Access token not valid.' && null)

                    const [requiredResponse, optionalResponse] = responses;

                    if (requiredResponse && optionalResponse) {
                        await db.collection('asa-configuration').doc(input.guild)
                            .set({ ['nitrado']: { requiredToken: requiredToken, optionalToken: optionalToken } },
                                { merge: true });

                    } else if (requiredResponse) {
                        await db.collection('asa-configuration').doc(input.guild)
                            .set({ ['nitrado']: { requiredToken: requiredToken } },
                                { merge: true });
                    }

                } catch (error) { return await interaction.followUp({ content: 'Setup failure, ensure you set the correct token.' }) }

                const installation = new ButtonKit()
                    .setCustomId('asa-setup-token')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Setup Token')
                    .setDisabled(true);

                const support = new ButtonKit()
                    .setURL('https://discord.gg/tGNNVRFS')
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Support Server');

                const row = new ActionRowBuilder()
                    .addComponents(installation, support);

                const embed = new EmbedBuilder()
                    .setDescription("**Ark Survival Ascended**\n**Cluster Setup & Overview**\nThank you for choosing our service. Below, you'll have the option to link your token, along with a [video preview](https://imgur.com/a3b9GkZ) to display the process.\n\n**Additional Information**\nEnsure this guild is a [community](https://i.imgur.com/q8ElPKj.mp4) server, otherwise, the bot will not be able to integrate properly.\n\n**[Partnership & Affiliation](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will receive partial commission!")
                    .setFooter({ text: 'Note: Contact support if issues persist.' })
                    .setImage('https://i.imgur.com/bFyqkUS.png')
                    .setColor(0x2ecc71);

                await interaction.message?.edit({ embeds: [embed], components: [row] })
                    .then(async () => {
                        await interaction.followUp({ content: "Proceeding with installation...", ephemeral: true });

                        // const roles = await interaction.guild.roles.fetch();
                        // const action = roles.map(async role => role.name === 'AS:A Obelisk Permission' ? await role.delete() : null);
                        // try { await Promise.all(action) } catch (error) { return await interaction.followUp({ content: 'In your settings, move the bot role higher.' }) }

                        await interaction.guild.roles.create({
                            name: 'AS:A Obelisk Permission',
                            color: '#ffffff',
                        });

                        const donationCategory = await interaction.guild.channels.create({
                            name: `AS:A Donation Overview`,
                            type: ChannelType.GuildCategory,
                        });

                        const donationChannel = await interaction.guild.channels.create({
                            name: '🍻│𝗗onation-𝗦upport',
                            type: ChannelType.GuildText,
                            parent: donationCategory
                        });

                        const statusCategory = await interaction.guild.channels.create({
                            name: `AS:A Status Overview`,
                            type: ChannelType.GuildCategory,
                        });

                        const statusChannel = await interaction.guild.channels.create({
                            name: '🔗│𝗦erver-𝗦tatus',
                            type: ChannelType.GuildText,
                            parent: statusCategory,
                            topic: 'Channel designed for organization, status updates generate here.'
                        });

                        await interaction.guild.channels.create({
                            name: '🔗│𝗖ommands',
                            type: ChannelType.GuildText,
                            parent: statusCategory,
                            topic: 'Channel designed for organization, execute slash commands here.'
                        });

                        const auditLoggingCategory = await interaction.guild.channels.create({
                            name: `AS:A Audit Logging`,
                            type: ChannelType.GuildCategory,
                        });

                        const playerAuditChannel = await interaction.guild.channels.create({
                            name: '📄│𝗣layer-𝗔udits',
                            type: ChannelType.GuildText,
                            parent: auditLoggingCategory,
                            topic: 'Audit logging channel, commands will be sent here for archive purposes.'
                        });

                        const serverAuditChannel = await interaction.guild.channels.create({
                            name: '📄│𝗦erver-𝗔udits',
                            type: ChannelType.GuildText,
                            parent: auditLoggingCategory,
                            topic: 'Audit logging channel, commands will be sent here for archive purposes.'
                        });

                        const gameLoggingCategory = await interaction.guild.channels.create({
                            name: `AS:A Game Logging`,
                            type: ChannelType.GuildCategory,
                        });

                        const onlineForumChannel = await interaction.guild.channels.create({
                            name: '📑│𝗢nline-𝗟ogging',
                            type: ChannelType.GuildForum,
                            parent: gameLoggingCategory,
                            topic: 'Awaiting thread installation, will display your logging data.'
                        });

                        const adminForumChannel = await interaction.guild.channels.create({
                            name: '📑│𝗔dmin-𝗟ogging',
                            type: ChannelType.GuildForum,
                            parent: gameLoggingCategory,
                            topic: 'Awaiting thread installation, will display your logging data.'
                        });

                        const chatForumChannel = await interaction.guild.channels.create({
                            name: '📑│𝗖hat-𝗟ogging',
                            type: ChannelType.GuildForum,
                            parent: gameLoggingCategory,
                            topic: 'Awaiting thread installation, will display your logging data.'
                        });

                        const installation = await interaction.guild.channels.create({
                            name: '📑│𝗜nstallation',
                            type: ChannelType.GuildText,
                            parent: gameLoggingCategory,
                            topic: 'Channel designed for organization, setup your logging here.'
                        });

                        const statusMessage = await statusChannel.send({ embeds: [await createStatusSetupEmbed()] });

                        await donationChannel.send({ embeds: [await createDonationEmbed()], content: 'https://buymeacoffee.com/cameronbryce'});

                        const loggingPrimaryButton = new ButtonKit()
                            .setCustomId('asa-automatic-setup')
                            .setLabel('Automatic Setup')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(false);

                        const loggingSecondaryButton = new ButtonKit()
                            .setCustomId('asa-manual-setup')
                            .setLabel('Manual Setup')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(false);

                        const loggingButtonRow = new ActionRowBuilder()
                            .addComponents(loggingPrimaryButton, loggingSecondaryButton);

                        await installation.send({ embeds: [await createLoggingEmbed()], components: [loggingButtonRow] });

                        const data = {
                            status: {
                                channel: statusChannel.id,
                                message: statusMessage.id
                            },
                            audits: {
                                player: { channel: playerAuditChannel.id },
                                server: { channel: serverAuditChannel.id }
                            },
                            forum: {
                                online: onlineForumChannel.id,
                                admin: adminForumChannel.id,
                                chat: chatForumChannel.id
                            },
                            online: FieldValue.delete(),
                            admin: FieldValue.delete(),
                            chat: FieldValue.delete(),
                        }
                        await db.collection('asa-configuration').doc(input.guild)
                            .set(data, { merge: true });
                    });
            }
        }
    })
};