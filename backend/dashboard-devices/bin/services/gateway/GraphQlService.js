'use strict'

const dashBoardDevices = require('../../domain/DashBoardDevices')();
const broker = require('../../tools/broker/BrokerFactory')();
const Rx = require('rxjs');
const jsonwebtoken = require('jsonwebtoken');
const jwtPublicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');

let instance;

class GraphQlService {

    constructor() {
        this.functionMap = this.generateFunctionMap();        
    }

    generateFunctionMap() {
        return {
            'gateway.graphql.query.getDashBoardDevicesAlarmReport': dashBoardDevices.getDashBoardDevicesAlarmReport,
            'gateway.graphql.query.getDashBoardDevicesCurrentNetworkStatus' : dashBoardDevices.getDashBoardDevicesCurrentNetworkStatus,
            'gateway.graphql.query.getDeviceTransactionsGroupByTimeInterval': dashBoardDevices.getDeviceTransactionsGroupByTimeInterval$,
            'gateway.graphql.query.getDeviceTransactionsGroupByIntervalAndGroupName': dashBoardDevices.getDeviceTransactionsGroupByIntervalAndGroupName$,
            'gateway.graphql.query.getDeviceTransactionsGroupByGroupName': dashBoardDevices.getDeviceTransactionsGroupByGroupName$,
            
        };
    }

    start() {
        broker.getMessageListener$(['Device'], Object.keys(this.functionMap))
            //decode and verify the jwt token
            .map(message => { 
                return { authToken: jsonwebtoken.verify(message.data.jwt, jwtPublicKey), message };
             })
            //ROUTE MESSAGE TO RESOLVER
            .mergeMap(({ authToken, message }) => 
              this.functionMap[message.type](message.data, authToken)
                .map(response => {
                    return { response, correlationId: message.id, replyTo: message.attributes.replyTo };
                })
                
            )
            //send response back if neccesary
            .subscribe(
                ({ response, correlationId, replyTo }) => {
                    // broker.send$('MaterializedViewUpdates','gateway.graphql.Subscription.response', response);
                    if (replyTo) {
                        broker.send$(replyTo, 'gateway.graphql.Query.response', response, { correlationId });                        
                    }
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

