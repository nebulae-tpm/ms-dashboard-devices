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
    }
  },
  Subscription: {
    onDeviceOnlineReported: {
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
                pubsub.publish("onDeviceOnlineReported", {
                  onDeviceOnlineReported: evt.data
                });
              },
              error =>
                console.error("Error listening onDeviceOnlineReported", error),
              () => console.log("onDeviceOnlineReported listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDeviceOnlineReported");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDeviceOfflineReported: {
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
                pubsub.publish("onDeviceOfflineReported", {
                  onDeviceOfflineReported: evt.data
                });
              },
              error =>
                console.error("Error listening onDeviceOfflineReported", error),
              () => console.log("onDeviceOfflineReported listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDeviceOfflineReported");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDeviceCpuUsageAlarmActivated: {
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
                pubsub.publish("onDeviceCpuUsageAlarmActivated", {
                  onDeviceCpuUsageAlarmActivated: evt.data
                });
              },
              error =>
                console.error("Error listening onDeviceCpuUsageAlarmActivated", error),
              () => console.log("onDeviceCpuUsageAlarmActivated listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDeviceCpuUsageAlarmActivated");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDeviceRamMemoryAlarmActivated:{
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
                pubsub.publish("onDeviceRamMemoryAlarmActivated", {
                  onDeviceRamMemoryAlarmActivated: evt.data
                });
              },
              error =>
                console.error("Error listening onDeviceRamMemoryAlarmActivated", error),
              () => console.log("onDeviceRamMemoryAlarmActivated listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDeviceRamMemoryAlarmActivated");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    },
    onDeviceTemperatureAlarmActivated:{
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
                pubsub.publish("onDeviceTemperatureAlarmActivated", {
                  onDeviceTemperatureAlarmActivated: evt.data
                });
              },
              error =>
                console.error("Error listening onDeviceTemperatureAlarmActivated", error),
              () => console.log("onDeviceTemperatureAlarmActivated listener STOPED :D")
            );

          context.webSocket.onUnSubscribe = Rx.Observable.create(observer => {
            subscription.unsubscribe();
            observer.next("rxjs subscription had been terminated");
            observer.complete();
          });
          return pubsub.asyncIterator("onDeviceTemperatureAlarmActivated");
        },
        (payload, variables, context, info) => {
          //return payload.authorEvent.lastName === variables.lastName;
          return true;
        }
      )
    }
    
  }
};
