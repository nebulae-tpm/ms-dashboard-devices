'use strict'

const DashBoardDevices = require('../../domain/DashBoardDevices');
const broker = require('../../tools/broker/BrokerFactory')();
const Rx = require('rxjs');

let instance;

class GraphQlService {

    constructor() {
        this.functionMap = this.generateFunctionMap();
    }

    generateFunctionMap() {
        return {
            'gateway.graphql.Query.DashBoardDevicesTest': DashBoardDevices.find
        };
    }

    start() {
        broker.getMessageListener$(['Device'], ['gateway.graphql.Query.DashBoardDevicesTest'])
            .mergeMap((message) =>
                this.functionMap[message.type](message.data)
                    .map(response => {
                        return { response, correlationId: message.id, replyTo: message.attributes.replyTo };
                    })
            )
            .subscribe(
                ({ response, correlationId, replyTo }) => {
                    broker.send$(replyTo, 'gateway.graphql.Query.response', response, { correlationId });
                },
                (error) => console.error('Error listening to messages', error),
                () => {
                    console.log(`Message listener stopped`);
                }
            );
    }

    stop() {

    }

}

module.exports = () => {
    if (!instance) {
        instance = new GraphQlService();
        console.log('NEW instance GraphQlService !!');
    }
    return instance;
};

