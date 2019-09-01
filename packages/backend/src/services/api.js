const axios = require('axios');

const api = axios.create({ baseURL: 'https://api.royaleapi.com' });

module.exports = api;
