"use strict";

const dashBoardDevices = require("../../domain/DashBoardDevices")();
const broker = require("../../tools/broker/BrokerFactory")();
const Rx = require("rxjs");
const jsonwebtoken = require("jsonwebtoken");
const jwtPublicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");

let instance;

class GraphQlService {
  constructor() {
    this.functionMap = this.generateFunctionMap();
    this.subscriptions = [];
  }

  generateFunctionMap() {
    return {
      "gateway.graphql.query.getDashBoardDevicesAlarmReport": {
        fn: dashBoardDevices.getDashBoardDevicesAlarmReport$,
        obj: dashBoardDevices
      },
      "gateway.graphql.query.getDashBoardDevicesCurrentNetworkStatus": {
        fn: dashBoardDevices.getDashBoardDevicesCurrentNetworkStatus$,
        obj: dashBoardDevices
      },
      "gateway.graphql.query.getDeviceTransactionsGroupByTimeInterval": {
        fn: dashBoardDevices.getDeviceTransactionsGroupByTimeInterval$,
        obj: dashBoardDevices
      },
      "gateway.graphql.query.getCuencaNamesWithSuccessTransactionsOnInterval": {
        fn: dashBoardDevices.getCuencaNamesWithSuccessTransactionsOnInterval$,
        obj: dashBoardDevices
      },
      "gateway.graphql.query.getDeviceTransactionsGroupByGroupName": {
        fn: dashBoardDevices.getDeviceTransactionsGroupByGroupName$,
        obj: dashBoardDevices
      },
      "gateway.graphql.query.getDeviceDashBoardTotalAccount": {
        fn: dashBoardDevices.getDeviceDashBoardTotalAccount$,
        obj: dashBoardDevices
      }
    };
  }

  start$() {
    const onErrorHandler = error => {
      console.error("Error handling  GraphQl incoming event", error);
      process.exit(1);
    };

    //default onComplete handler
    const onCompleteHandler = () => {
      () => console.log("GraphQlService incoming event subscription completed");
    };
    console.log("GraphQl Service starting ...");


    return Rx.Observable.from(this.getSubscriptionDescriptors())
    .map( aggregateEvent => ({ ...aggregateEvent, onErrorHandler, onCompleteHandler }))
    .map(params => this.subscribeEventHandler(params));
  }

  subscribeEventHandler({
    aggregateType,
    messageType,
    onErrorHandler,
    onCompleteHandler
  }) {
    const handler = this.functionMap[messageType];
    const subscription = broker
    .getMessageListener$([aggregateType], [messageType])
    .mergeMap(message => this.verifyRequest$(message))
    .mergeMap(request => ( request.failedValidations.length > 0)
      ? Rx.Observable.of(request.errorResponse)
      : Rx.Observable.of(request)
        //ROUTE MESSAGE TO RESOLVER
        .mergeMap(({ authToken, message }) =>
          handler.fn
            .call(handler.obj, message.data, authToken)
            .map(response => ({ response, correlationId: message.id, replyTo: message.attributes.replyTo }))
        )
    )    
    .mergeMap(msg => this.sendResponseBack$(msg))
    .subscribe(
      msg => { /* console.log(`GraphQlService: ${messageType} process: ${msg}`); */ },
      onErrorHandler,
      onCompleteHandler
    );
    this.subscriptions.push({
      aggregateType,
      messageType,
      handlerName: handler.fn.name,
      subscription
    });
    return {
      aggregateType,
      messageType,
      handlerName: `${handler.obj.name}.${handler.fn.name}`
    };
  }

     /**
   * Verify the message if the request is valid.
   * @param {any} request request message
   * @returns { Rx.Observable< []{request: any, failedValidations: [] }>}  Observable object that containg the original request and the failed validations
   */
  verifyRequest$(request) {
    return Rx.Observable.of(request)
      //decode and verify the jwt token
      .mergeMap(message =>
        Rx.Observable.of(message)
          .map(message => ({ authToken: jsonwebtoken.verify(message.data.jwt, jwtPublicKey), message, failedValidations: [] }))
          .catch(err =>
            EventSourcingMonitor.errorHandler$(err)
              .map(response => ({
                errorResponse: { response, correlationId: message.id, replyTo: message.attributes.replyTo },
                failedValidations: ['JWT']
              }
              ))
          )
      )
  }

 /**
  * 
  * @param {any} msg Object with data necessary  to send response
  */
 sendResponseBack$(msg) {
  return Rx.Observable.of(msg).mergeMap(
    ({ response, correlationId, replyTo }) =>
      replyTo
        ? broker.send$(replyTo, "gateway.graphql.Query.response", response, {
            correlationId
          })
        : Rx.Observable.of(undefined)
  );
}

  stop$() {
    Rx.Observable.from(this.subscriptions).map(subscription => {
      subscription.subscription.unsubscribe();
      return `Unsubscribed: aggregateType=${aggregateType}, eventType=${eventType}, handlerName=${handlerName}`;
    });
  }


  getSubscriptionDescriptors(){
    return [
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getDashBoardDevicesAlarmReport"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getDashBoardDevicesCurrentNetworkStatus"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getDeviceTransactionsGroupByTimeInterval"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getCuencaNamesWithSuccessTransactionsOnInterval"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getDeviceTransactionsGroupByGroupName"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getDeviceDashBoardTotalAccount"
      }
    ];
  }
}

/**
 * @returns {GraphQlService}
 */
module.exports = () => {
  if (!instance) {
    instance = new GraphQlService();
    console.log("NEW instance GraphQlService  !!");
  }
  return instance;
};
