// noinspection JSUnresolvedReference

const { default: axios } = require("axios");

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 1000 });

const getGameservers = async (token, service) => {
    try {
        const url = `https://api.nitrado.net/services/${service}/gameservers`;
        const response = await http.get(url, { headers: { 'Authorization': token } });

        const { gameserver } = response.data.data;

        return { gameserver };

    } catch (error) { console.log(error) }
};

module.exports = { getGameservers };