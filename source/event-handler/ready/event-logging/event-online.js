// noinspection JSUnresolvedReference

const { processOnlineLogging } = require('./logging-modules/processOnlineLogging');
const { getGameservers } = require('../../../services/requests/getGameservers');
const { getServices } = require('../../../services/requests/getServices');
const { db } = require('../../../script.js');
const { Rcon } = require('rcon-client');

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = (client) => {

    const loop = async () => {
        const reference = await db.collection('asa-configuration').get();

        await Promise.all(reference.docs.map(async (doc) => {
            // Extract nitrado and status from Firestore document
            const { nitrado, online } = doc.data();

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
                            const response = await rcon.send(`ListPlayers`);

                            if (online) {
                                if (response) await processOnlineLogging(client, online, service_id, response);
                            }
                        });

                        rcon.on('error', (error) => {
                            console.log(`RCON error on service ${service_id}:`, error.message);
                        });

                        rcon.on('end', () => {
                            console.log('RCON connection closed');
                        });

                        await rcon.connect();

                    }).catch(error => { console.log(error); });
                }));
            }));
        }));

        // Restart the loop after 60 seconds
        setTimeout(loop, 10000);
    };

    loop().then(() => console.log('Logging loop started...'));
};