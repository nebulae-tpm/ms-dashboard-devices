// 'use strict'

// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').load();
// }

// const graphQlService = require('./services/gateway/GraphQlService')();
// const EventStoreService = require('./services/eventStore/EventStoreService')();
// const mongoDB = require('./data/MongoDB')();



// mongoDB.init$().subscribe(
//     (str) => console.log(str),
//     (error) => console.error(`Failed to connect to MongoDB`,error),
//     () => console.log('Mongo db init completed')
// );
// graphQlService.start();
// EventStoreService.start();

'use strict'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const eventSourcing = require('./tools/EventSourcing')();
const eventStoreService = require('./services/event-store/EventStoreService')();
const mongoDB = require('./data/MongoDB')();
const graphQlService = require('./services/gateway/GraphQlService')();
const Rx = require('rxjs');

const start = () => {
    Rx.Observable.concat(
        eventSourcing.eventStore.start$(),
        eventStoreService.start$(),
        mongoDB.init$()
    ).subscribe(
        (evt) => {
            // console.log(evt)
        },
        (error) => {
            console.error('Failed to start', error);
            process.exit(1);
        },
        () => console.log('dashboard-devices started')
    );
};

start();
graphQlService.start();


