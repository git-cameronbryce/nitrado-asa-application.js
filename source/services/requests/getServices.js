// noinspection JSUnresolvedReference

const { default: axios } = require("axios");

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 1000 });

const platforms = ['arksa'];
const getServices = async (token) => {
    try {
        const url = 'https://api.nitrado.net/services';
        const response = await http.get(url, { headers: { 'Authorization': token } });


        console.log('Requested: https://api.nitrado.net/services');

        let identifiers = [];
        response.data.data.services.forEach(service => {
            if (platforms.includes(service.details.folder_short) && service.status === 'active') {
                identifiers.push(service.id);
            }
        });

        return identifiers;
    } catch (error) { console.log(error) }
};

module.exports = { getServices };