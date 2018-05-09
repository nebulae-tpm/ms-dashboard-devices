const withFilter = require("graphql-subscriptions").withFilter;
const PubSub = require("graphql-subscriptions").PubSub;
const pubsub = new PubSub();
const Rx = require("rxjs");

module.exports = {
  Query: {
    getDashBoardDevicesAlarmReport(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDashBoardDevicesAlarmReport",
          { root, args, jwt: context.encodedToken },
          500
        )
        .toPromise();
    },
    getDashBoardDevicesCurrentNetworkStatus(root, args, context){
      return context.broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDashBoardDevicesCurrentNetworkStatus",
          { root, args, jwt: context.encodedToken },
          500
        )
        .toPromise();
    },
    getDeviceTransactionsGroupByIntervalAndGroupName(root, args, context) {
      console.log('getDeviceTransactionsGroupByIntervalAndGroupName', args);
      return context.broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDeviceTransactionsGroupByIntervalAndGroupName",
          { root, args, jwt: context.encodedToken },
          500
        )
        .toPromise();
    },
    getSucessDeviceTransactionsGroupByGroupName(root, args, context) {
      console.log('getDeviceTransactionsGroupByGroupName', args);
      return context.broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDeviceTransactionsGroupByGroupName",
          { root, args, jwt: context.encodedToken },
          500
        )
        .toPromise();      
    },
    getDeviceTransactionsGroupByTimeInterval(root, args, context) {
      console.log('getDeviceTransactionGroupByTimeInterval', args);
      return context.broker
        .forwardAndGetReply$(
          "Device",
          "gateway.graphql.query.getDeviceTransactionsGroupByTimeInterval",
          { root, args, jwt: context.encodedToken },
          500
        )
        .toPromise();
    },
    getDeviceDashBoardTotalAccount(root, args, context){
      console.log('getDeviceDashBoardTotalAccount', args);
      return context.broker
      .forwardAndGetReply$(
        "Device",
        "gateway.graphql.query.getDeviceDashBoardTotalAccount",
        { root, args, jwt: context.encodedToken },
        500
      )
      .toPromise();
    }
  },
  Subscription: {
    onDashBoardDeviceOnlineReported: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceConnected"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceOnlineReported", {
                  onDashBoardDeviceOnlineReported: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceOnlineReported", error),
              () => console.log("onDashBoardDeviceOnlineReported listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
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
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceDisconnected"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceOfflineReported", {
                  onDashBoardDeviceOfflineReported: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceOfflineReported", error),
              () => console.log("onDashBoardDeviceOfflineReported listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
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
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceCpuUsageAlarmActivated"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceCpuUsageAlarmActivated", {
                  onDashBoardDeviceCpuUsageAlarmActivated: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceCpuUsageAlarmActivated", error),
              () => console.log("onDashBoardDeviceCpuUsageAlarmActivated listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDashBoardDeviceCpuUsageAlarmActivated");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceRamMemoryAlarmActivated:{
      subscribe: withFilter(
        (payload, variables, context, info) => {
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceRamMemoryAlarmActivated"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceRamMemoryAlarmActivated", {
                  onDashBoardDeviceRamMemoryAlarmActivated: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceRamMemoryAlarmActivated", error),
              () => console.log("onDashBoardDeviceRamMemoryAlarmActivated listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDashBoardDeviceRamMemoryAlarmActivated");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceTemperatureAlarmActivated:{
      subscribe: withFilter(
        (payload, variables, context, info) => {
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceTemperatureAlarmActivated"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceTemperatureAlarmActivated", {
                  onDashBoardDeviceTemperatureAlarmActivated: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceTemperatureAlarmActivated", error),
              () => console.log("onDashBoardDeviceTemperatureAlarmActivated listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDashBoardDeviceTemperatureAlarmActivated");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDashBoardDeviceLowVoltageAlarmReported:{
      subscribe: withFilter(
        (payload, variables, context, info) => {
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceLowVoltageAlarmReported"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceLowVoltageAlarmReported", {
                  onDashBoardDeviceLowVoltageAlarmReported: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceLowVoltageAlarmReported", error),
              () => console.log("onDashBoardDeviceLowVoltageAlarmReported listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDashBoardDeviceLowVoltageAlarmReported");
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
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["DeviceHighVoltageAlarmReported"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("onDashBoardDeviceHighVoltageAlarmReported", {
                  onDashBoardDeviceHighVoltageAlarmReported: evt.data
                });
              },
              error =>
                console.error("Error listening onDashBoardDeviceHighVoltageAlarmReported", error),
              () => console.log("onDashBoardDeviceHighVoltageAlarmReported listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDashBoardDeviceHighVoltageAlarmReported");
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
          const subscription = context.broker
            .getMaterializedViewsUpdates$(["deviceTransactionsUpdatedEvent"])
            .subscribe(
              evt => {
                console.log({
                  type: evt.type,
                  data: evt.data
                });
                pubsub.publish("deviceTransactionsUpdatedEvent", {
                  deviceTransactionsUpdatedEvent: evt.data
                });
              },
              error =>
                console.error("Error listening deviceTransactionsUpdatedEvent", error),
              () => console.log("deviceTransactionsUpdatedEvent listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
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
