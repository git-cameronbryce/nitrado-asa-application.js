// noinspection JSUnresolvedReference

const { processAdminLogging } = require('./logging-modules/processAdminLogging');
const { processChatLogging } = require('./logging-modules/processChatLogging');

const { getServices } = require('../../../services/requests/getServices');
const { getGameservers } = require('../../../services/requests/getGameservers');
const { db } = require('../../../script.js');
const { Rcon } = require('rcon-client');

process.on('unhandledRejection', () => {
    console.log('unhandledRejection');
});

module.exports = (client) => {
    const loop = async () => {
        const reference = await db.collection('asa-configuration').get();

        await Promise.all(reference.docs.map(async (doc) => {
            const { nitrado, admin, chat } = doc.data();

            await Promise.all(Object.values(nitrado).map(async token => {
                const services = await getServices(token);

                await Promise.all(services.map(async service => {
                    const gameservers = await getGameservers(token, service);
                    const { gameserver: { status, ip, service_id, rcon_port, settings: { config } } } = gameservers;

                    if (status !== 'started') return;
                    await new Promise(async (resolve) => {
                        setTimeout(() => resolve(), 1250);

                        const rcon = new Rcon({
                            host: ip,
                            port: rcon_port,
                            password: config['current-admin-password']
                        });

                        rcon.on('authenticated', async () => {
                            const response = await rcon.send('GetChat');

                            console.log(response);
                            if (response) {
                                if (admin) await processAdminLogging(client, admin, service_id, response);
                                if (chat) await processChatLogging(client, chat, service_id, response);
                            }
                        });

                        rcon.on('error', (error) => {
                            console.log('rcon.on(error)')
                        });

                        rcon.on('end', () => {
                            console.log('rcon.on(end)')
                        });

                        await rcon.connect();

                    }).catch(error => { console.log(error); });
                }));
            }));
        }));

        setTimeout(loop, 10000); // Restart loop after 60 seconds
    };

    loop().then(() => console.log('Logging loop started...'));
};
