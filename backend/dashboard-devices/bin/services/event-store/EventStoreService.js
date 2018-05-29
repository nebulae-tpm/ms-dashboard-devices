"use strict";
const Rx = require("rxjs");
const eventSourcing = require("../../tools/EventSourcing")();
const dashBoardDevices = require("../../domain/DashBoardDevices")();

let instance;

class EventStoreService {
  constructor() {
    this.functionMap = this.generateFunctionMap();
    this.subscriptions = [];
  }

  generateFunctionMap() {
    return {
      DeviceConnected: {
        fn: dashBoardDevices.handleDeviceConnectedEvent$,
        obj: dashBoardDevices
      },
      DeviceDisconnected: {
        fn: dashBoardDevices.handleDeviceDisconnectedEvent$,
        obj: dashBoardDevices
      },
      DeviceCpuUsageAlarmActivated: {
        fn: dashBoardDevices.DeviceCpuUsageAlarmActivated$,
        obj: dashBoardDevices
      },
      DeviceRamuUsageAlarmActivated: {
        fn: dashBoardDevices.onDeviceRamuUsageAlarmActivated$,
        obj: dashBoardDevices
      },
      DeviceTemperatureAlarmActivated: {
        fn: dashBoardDevices.onDeviceTemperatureAlarmActivated$,
        obj: dashBoardDevices
      },
      DeviceLowVoltageAlarmReported: {
        fn: dashBoardDevices.handleDeviceLowVoltageAlarmEvent$,
        obj: dashBoardDevices
      },
      DeviceHighVoltageAlarmReported: {
        fn: dashBoardDevices.handleDeviceHighVoltageAlarmEvent$,
        obj: dashBoardDevices
      },
      DeviceDeviceStateReported: {
        fn: dashBoardDevices.handleDeviceStateReportedEvent$,
        obj: dashBoardDevices
      },
      DeviceMainAppUsosTranspCountReported: {
        fn: dashBoardDevices.persistSuccessDeviceTransaction$,
        obj: dashBoardDevices
      },
      DeviceMainAppErrsTranspCountReported: {
        fn: dashBoardDevices.persistFailedDeviceTransaction$,
        obj: dashBoardDevices
      },
      CleanDashBoardHistory: {
        fn: dashBoardDevices.removeAllObsoleteMongoDocuments$,
        obj: dashBoardDevices
      }
    };
  }

  /**
   * Starts listening to the EventStore
   * Returns observable that resolves to each subscribe agregate/event
   *    emit value: { aggregateType, eventType, handlerName}
   */
  start$() {
    ////##################################################################
    ///######## SOLO PARA GENERAR  REGISTROS DE ALARMAS##############
    ////##################################################################

    // Rx.Observable.interval(5000).subscribe(() => {
    //   dashBoardDevices.generateAlarms__RANDOM__$()
    //   .subscribe(r => {});
    // });

    // Rx.Observable.interval(3000).subscribe(() => {
    //   dashBoardDevices.generateDevices__RANDOM__$()
    //   .subscribe(
    //     r => {},
    //     e => {}
    //   );
    // });

    // Rx.Observable.interval(3000).subscribe(() => {
    //   dashBoardDevices
    //     .persistFailedDeviceTransaction$({
    //       et: "DeviceMainAppUsosTranspCountReported",
    //       etv: 1,
    //       at: "Device",
    //       aid: `sn0000-000${Math.floor(Math.random() * 10)}-TEST`,
    //       data: {
    //         count: Math.floor(Math.random() * 5 + 1),
    //         timestamp: Date.now()
    //       },
    //       user: "SYSTEM.DevicesReport.devices-report-handler",
    //       timestamp: Date.now(),
    //       av: 174,
    //       _id: "5ad7cd023a8ce443f84f8f8c"
    //     })
    //     .subscribe(r => {}, e => {});
    // });

    // Rx.Observable.interval(3000).subscribe(() => {
    //   dashBoardDevices.persistSuccessDeviceTransaction$({
    //     et: "DeviceMainAppUsosTranspCountReported",
    //     etv: 1,
    //     at: "Device",
    //     aid: `sn0000-000${Math.floor(Math.random() * 10)}-TEST`,
    //     data: {
    //       count: Math.floor(Math.random() * 11 + 1),
    //       timestamp: Date.now()
    //     },
    //     user: "SYSTEM.DevicesReport.devices-report-handler",
    //     timestamp: Date.now(),
    //     av: 174,
    //     _id: "5ad7cd023a8ce443f84f8f8c"
    //   })
    //   .subscribe(r => {}, e => {});
    // });

    ////##################################################################
    ////##################################################################

    //default error handler
    const onErrorHandler = error => {
      console.error("Error handling  EventStore incoming event", error);
      proccess.exit(1);
    };
    //default onComplete handler
    const onCompleteHandler = () => {
      () => console.log("EventStore incoming event subscription completed");
    };
    console.log("EventStoreService starting ...");

    return Rx.Observable.from([
      {
        aggregateType: "Device",
        eventType: "DeviceConnected",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceDisconnected",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceDeviceStateReported",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceCpuUsageAlarmActivated",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceRamuUsageAlarmActivated",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceTemperatureAlarmActivated",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceLowVoltageAlarmReported",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceHighVoltageAlarmReported",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceMainAppUsosTranspCountReported",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Device",
        eventType: "DeviceMainAppErrsTranspCountReported",
        onErrorHandler,
        onCompleteHandler
      },
      {
        aggregateType: "Cronjob",
        eventType: "CleanDashBoardHistory",
        onErrorHandler,
        onCompleteHandler
      }
    ]).map(params => this.subscribeEventHandler(params));
  }

  /**
   * Stops listening to the Event store
   * Returns observable that resolves to each unsubscribed subscription as string
   */
  stop$() {
    Rx.Observable.from(this.subscriptions).map(subscription => {
      subscription.subscription.unsubscribe();
      return `Unsubscribed: aggregateType=${aggregateType}, eventType=${eventType}, handlerName=${handlerName}`;
    });
  }

  /**
   * Create a subscrition to the event store and returns the subscription info
   * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
   * @return { aggregateType, eventType, handlerName  }
   */
  subscribeEventHandler({
    aggregateType,
    eventType,
    onErrorHandler,
    onCompleteHandler
  }) {
    const handler = this.functionMap[eventType];
    const subscription = eventSourcing.eventStore
      .getEventListener$(aggregateType)
      .filter(evt => evt.et === eventType)
      .mergeMap(evt => handler.fn.call(handler.obj, evt))
      .subscribe(
        evt => {
          console.log(`EventStoreService: ${eventType} process: ${evt}`);
        },
        onErrorHandler,
        onCompleteHandler
      );
    this.subscriptions.push({
      aggregateType,
      eventType,
      handlerName: handler.fn.name,
      subscription
    });
    return {
      aggregateType,
      eventType,
      handlerName: `${handler.obj.name}.${handler.fn.name}`
    };
  }
}

module.exports = () => {
  if (!instance) {
    instance = new EventStoreService();
    console.log("NEW  EventStore instance  !!");
  }
  return instance;
};
