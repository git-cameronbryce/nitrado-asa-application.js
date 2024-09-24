// noinspection JSCheckFunctionSignatures,JSUnresolvedReference,SpellCheckingInspection,EqualityComparisonWithCoercionJS

const { createLoggingThreadDuplicateEmbed, createLoggingThreadInvalidEmbed, createLoggingCreationEmbed, createLoggingThreadEmbed, createLoggingQueryEmbed } = require('../../../../services/event-embeds/event-logging/embeds');
const { getGameservers } = require('../../../../services/requests/getGameservers')
const { getServices } = require('../../../../services/requests/getServices');

const { Events, ChannelType } = require('discord.js');
const { db } = require('../../../../script');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isModalSubmit()) {

            if (interaction.customId === 'asa-modal-manual-setup') {
                await interaction.deferReply({ ephemeral: true });

                const input = {
                    identifier: interaction.fields.getTextInputValue('asa-gameserver-identifier-required')
                };

                const reference = (await db.collection('asa-configuration').doc(interaction.guild.id).get()).data();

                await Promise.all(Object.values(reference.nitrado)?.map(async token => {
                    const services = await getServices(token);

                    let isValid = false;
                    await Promise.all(services.map(async service => {
                        if (input.identifier != service) return;

                        isValid = true;
                        let isDuplicate = false;
                        Object.entries(reference.admin || {}).map(async ([key, value]) => {

                            if (key == input.identifier) {
                                isDuplicate = true; await interaction.followUp({ embeds: [await createLoggingThreadDuplicateEmbed()] });
                            }
                        })

                        if (isDuplicate) return;
                        const gameservers = await getGameservers(token, service);

                        const { gameserver: { service_id, query }} = gameservers;

                        if (!query.server_name) return await interaction.followUp({ embeds: [await createLoggingQueryEmbed()] });

                        const onlineThread = await interaction.client.channels.fetch(reference.forum.online)
                            .then(async forum =>
                                forum.threads.create({
                                    type: ChannelType.PrivateThread,
                                    name: `${query.server_name} - ${service_id}`,
                                    message: { embeds: [await createLoggingThreadEmbed(service_id)] }
                                })
                            );

                        const adminThread = await interaction.client.channels.fetch(reference.forum.admin)
                            .then(async forum =>
                                forum.threads.create({
                                    type: ChannelType.PrivateThread,
                                    name: `${query.server_name} - ${service_id}`,
                                    message: { embeds: [await createLoggingThreadEmbed(service_id)] }
                                })
                            );

                        const chatThread = await interaction.client.channels.fetch(reference.forum.chat)
                            .then(async forum =>
                                forum.threads.create({
                                    type: ChannelType.PrivateThread,
                                    name: `${query.server_name} - ${service_id}`,
                                    message: { embeds: [await createLoggingThreadEmbed(service_id)] }
                                })
                            );

                        const data = {
                            'online': { [service_id]: { thread: onlineThread.id, message: onlineThread.lastMessageId } },
                            'admin': { [service_id]: adminThread.id },
                            'chat': { [service_id]: chatThread.id }
                        };

                        await db.collection('asa-configuration').doc(interaction.guild.id).set(data, { merge: true })
                            .then(() => { console.log('Database Logging Finished:') });

                        await interaction.followUp({ embeds: [await createLoggingCreationEmbed()] });
                    }));

                    if (!isValid) await interaction.followUp({ embeds: [await createLoggingThreadInvalidEmbed()] });
                }));
            }
        }
    });
};