const withFilter = require("graphql-subscriptions").withFilter;
const PubSub = require("graphql-subscriptions").PubSub;
const pubsub = new PubSub();
const { of } = require("rxjs");
const { mergeMap, map } = require("rxjs/operators");
const broker = require("../../broker/BrokerFactory")();

function getReponseFromBackEnd$(response) {
  return of(response).pipe(
    map(resp => {
      if (resp.result.code != 200) {
        const err = new Error();
        err.name = "Error";
        err.message = resp.result.error;
        // this[Symbol()] = resp.result.error;
        Error.captureStackTrace(err, "Error");
        throw err;
      }
      return resp.data;
    })
  );
}

module.exports = {
  Query: {
    getDashBoardDevicesAlarmReport(root, args, context) {
      return broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDashBoardDevicesAlarmReport",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getDashBoardDevicesCurrentNetworkStatus(root, args, context) {
      return broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDashBoardDevicesCurrentNetworkStatus",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getCuencaNamesWithSuccessTransactionsOnInterval(root, args, context) {
      // console.log('getCuencaNamesWithSuccessTransactionsOnInterval', args);
      return broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getCuencaNamesWithSuccessTransactionsOnInterval",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getSucessDeviceTransactionsGroupByGroupName(root, args, context) {
      // console.log('[GATEWAY]--getDeviceTransactionsGroupByGroupName', args);
      return broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDeviceTransactionsGroupByGroupName",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getDeviceTransactionsGroupByTimeInterval(root, args, context) {
      // console.log('getDeviceTransactionGroupByTimeInterval', args);
      return broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDeviceTransactionsGroupByTimeInterval",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getDeviceDashBoardTotalAccount(root, args, context) {
      // console.log('getDeviceDashBoardTotalAccount', args);
      return broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDeviceDashBoardTotalAccount",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    }
  },
  Subscription: {
    onDashBoardDeviceOnlineReported: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator("onDashBoardDeviceOnlineReported");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceOfflineReported: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator("onDashBoardDeviceOfflineReported");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceCpuUsageAlarmActivated: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator(
            "onDashBoardDeviceCpuUsageAlarmActivated"
          );
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceRamMemoryAlarmActivated: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator(
            "onDashBoardDeviceRamMemoryAlarmActivated"
          );
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceTemperatureAlarmActivated: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator(
            "onDashBoardDeviceTemperatureAlarmActivated"
          );
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceLowVoltageAlarmReported: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator(
            "onDashBoardDeviceLowVoltageAlarmReported"
          );
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceHighVoltageAlarmReported: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator(
            "onDashBoardDeviceHighVoltageAlarmReported"
          );
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },

    deviceTransactionsUpdatedEvent: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator("deviceTransactionsUpdatedEvent");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    }
  }
};

const eventDescriptors = [
  {
    backendEventName: "DeviceHighVoltageAlarmReported",
    gqlSubscriptionName: "onDashBoardDeviceHighVoltageAlarmReported",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "deviceTransactionsUpdatedEvent",
    gqlSubscriptionName: "deviceTransactionsUpdatedEvent",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "DeviceLowVoltageAlarmReported",
    gqlSubscriptionName: "onDashBoardDeviceLowVoltageAlarmReported",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "DeviceTemperatureAlarmActivated",
    gqlSubscriptionName: "onDashBoardDeviceTemperatureAlarmActivated",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "DeviceRamMemoryAlarmActivated",
    gqlSubscriptionName: "onDashBoardDeviceRamMemoryAlarmActivated",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "DeviceCpuUsageAlarmActivated",
    gqlSubscriptionName: "onDashBoardDeviceCpuUsageAlarmActivated",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "DeviceDisconnected",
    gqlSubscriptionName: "onDashBoardDeviceOfflineReported",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  },
  {
    backendEventName: "DeviceConnected",
    gqlSubscriptionName: "onDashBoardDeviceOnlineReported",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  }
];

/**
 * Connects every backend event to the right GQL subscription
 */
eventDescriptors.forEach(descriptor => {
  broker.getMaterializedViewsUpdates$([descriptor.backendEventName]).subscribe(
    evt => {
      if (descriptor.onEvent) {
        descriptor.onEvent(evt, descriptor);
      }
      const payload = {};
      payload[descriptor.gqlSubscriptionName] = descriptor.dataExtractor
        ? descriptor.dataExtractor(evt)
        : evt.data;
      pubsub.publish(descriptor.gqlSubscriptionName, payload);
    },

    error => {
      if (descriptor.onError) {
        descriptor.onError(error, descriptor);
      }
      console.error(`Error listening ${descriptor.gqlSubscriptionName}`, error);
    },

    () => console.log(`${descriptor.gqlSubscriptionName} listener STOPED`)
  );
});
