"use strict";
const Rx = require("rxjs");
const eventSourcing = require("../../tools/EventSourcing")();
const dashBoardDevices = require("../../domain/DashBoardDevices")();
const mbeKey = "ms-dashboard-devices_mbe_dashboard-devices";

let instance;

class EventStoreService {
  constructor() {
    this.functionMap = this.generateFunctionMap();
    this.subscriptions = [];
    this.aggregateEventsArray = this.generateAggregateEventsArray();
  }

  generateFunctionMap() {
    return {
      DeviceConnected: {
        fn: dashBoardDevices.handleDeviceConnectedEvent$,
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
      CleanDashBoardDevicesHistoryJobTriggered: {
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
    //default error handler
    const onErrorHandler = error => {
      console.error("Error handling  EventStore incoming event", error);
      process.exit(1);
    };
    //default onComplete handler
    const onCompleteHandler = () => {
      () => console.log("EventStore incoming event subscription completed");
    };
    console.log("EventStoreService starting ...");

    return Rx.Observable.from(this.aggregateEventsArray)
            .map(aggregateEvent => { return { ...aggregateEvent, onErrorHandler, onCompleteHandler } })
            .map(params => this.subscribeEventHandler(params));
  }

  /**
   * Stops listening to the Event store
   * Returns observable that resolves to each unsubscribed subscription as string
   */
  stop$() {
    return Rx.Observable.from(this.subscriptions).map(subscription => {
      subscription.subscription.unsubscribe();
      return `Unsubscribed: aggregateType=${aggregateType}, eventType=${eventType}, handlerName=${handlerName}`;
    });
  }

  /**
     * Create a subscrition to the event store and returns the subscription info     
     * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
     * @return { aggregateType, eventType, handlerName  }
     */
    subscribeEventHandler({ aggregateType, eventType, onErrorHandler, onCompleteHandler }) {
      const handler = this.functionMap[eventType];
      const subscription =
          //MANDATORY:  AVOIDS ACK REGISTRY DUPLICATIONS
          eventSourcing.eventStore.ensureAcknowledgeRegistry$(aggregateType)
              .mergeMap(() => eventSourcing.eventStore.getEventListener$(aggregateType,mbeKey))
              .filter(evt => evt.et === eventType)
              .mergeMap(evt => Rx.Observable.concat(
                  handler.fn.call(handler.obj, evt),
                  //MANDATORY:  ACKWOWLEDGE THIS EVENT WAS PROCESSED
                  eventSourcing.eventStore.acknowledgeEvent$(evt, mbeKey),
              ))
              .subscribe(
                  (evt) => {
                    // console.log(`EventStoreService: ${eventType} process: ${evt}`);
                  },
                  onErrorHandler,
                  onCompleteHandler
              );
      this.subscriptions.push({ aggregateType, eventType, handlerName: handler.fn.name, subscription });
      return { aggregateType, eventType, handlerName: `${handler.obj.name}.${handler.fn.name}` };
  }

  /**
  * Starts listening to the EventStore
  * Returns observable that resolves to each subscribe agregate/event
  *    emit value: { aggregateType, eventType, handlerName}
  */
  syncState$() {
      return Rx.Observable.from(this.aggregateEventsArray)
          .concatMap(params => this.subscribeEventRetrieval$(params))
  }



  /**
   * Create a subscrition to the event store and returns the subscription info     
   * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
   * @return { aggregateType, eventType, handlerName  }
   */
  subscribeEventRetrieval$({ aggregateType, eventType }) {
      const handler = this.functionMap[eventType];
      //MANDATORY:  AVOIDS ACK REGISTRY DUPLICATIONS
      return eventSourcing.eventStore.ensureAcknowledgeRegistry$(aggregateType)
          .switchMap(() => eventSourcing.eventStore.retrieveUnacknowledgedEvents$(aggregateType, mbeKey))
          .filter(evt => evt.et === eventType)
          .concatMap(evt => Rx.Observable.concat(
              handler.fn.call(handler.obj, evt),
              //MANDATORY:  ACKWOWLEDGE THIS EVENT WAS PROCESSED
              eventSourcing.eventStore.acknowledgeEvent$(evt, mbeKey)
          ));
  }

   /**
   * Generates a map that assocs each AggretateType withs its events
   */
  generateAggregateEventsArray() {
    return [
      {
        aggregateType: "Device",
        eventType: "DeviceConnected"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceDeviceStateReported"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceCpuUsageAlarmActivated"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceRamuUsageAlarmActivated"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceTemperatureAlarmActivated"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceLowVoltageAlarmReported"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceHighVoltageAlarmReported"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceMainAppUsosTranspCountReported"
      },
      {
        aggregateType: "Device",
        eventType: "DeviceMainAppErrsTranspCountReported"
      },
      {
        aggregateType: "Cronjob",
        eventType: "CleanDashBoardDevicesHistoryJobTriggered"
      }
    ]
  }
}

 
/**
 * @returns {EventStoreService}
 */
module.exports = () => {
  if (!instance) {
    instance = new EventStoreService();
    console.log("NEW  EventStore instance  !!");
  }
  return instance;
};

