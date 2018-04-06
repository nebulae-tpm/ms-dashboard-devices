'use strict'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const graphQlService = require('./services/gateway/GraphQlService')();


graphQlService.start();

