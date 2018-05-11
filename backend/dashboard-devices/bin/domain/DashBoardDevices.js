"use strict";

const Rx = require("rxjs");
const AlarmReportDA = require("../data/AlarmReportDA");
const DeviceStatus = require("../data/DevicesStatusDA");
const DeviceTransactionsDA = require("../data/DeviceTransactionsDA");
const broker = require("../tools/broker/BrokerFactory.js")();

const MATERIALIZED_VIEW_TOPIC = 'materialized-view-updates';

let instance;

class DashBoardDevices {
  constructor() {}

  /**
   * delivers the current status of the alarm by type
   * @param {*} param0
   * @param {*} authToken
   */
  getDashBoardDevicesAlarmReport({ root, args, jwt }, authToken) {
    console.log("getDashBoardDevicesAlarmReport", args.type);
    return instance
      .getTimeRangesToLimit$({}, args.type)
      .mergeMap(result => AlarmReportDA.getDashBoardDevicesAlarmReport$(result))
      .mergeMap(array => instance.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: args.type,
          timeRanges: timeranges
        };
      });
  }

  /**
   * Get the current device on Vs device off chart status
   * @param {*} param0
   * @param {*} authToken
   */
  getDashBoardDevicesCurrentNetworkStatus({ root, args, jwt }, authToken) {
    console.log("getDashBoardDevicesCurrentNetworkStatus ..", root, args);
    return DeviceStatus.getTotalDeviceByCuencaAndNetworkState$()
      .map(results => results.filter(result => result._id.cuenca))  
      .mergeMap(devices => instance.mapToCharBarData$(devices))
      .toArray();
  }

  /**
   *  Get the Devices count
   */
  getDeviceDashBoardTotalAccount$({ root, args, jwt }, authToken){
    console.log("getDashBoardDevicesCurrentNetworkStatus ..", root, args);
    return DeviceStatus.getDevicesTotalAccount$();
  }

  /**
   * Reaction to deviceOnlineReported
   */
  handleDeviceConnectedEvent$(evt) {
    console.log("handleDeviceConnectedEvent", evt, evt.aid);
    return DeviceStatus.onDeviceOnlineReported(evt.aid)
    .map(results => results.filter(result => result._id.cuenca))
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(msg =>
        broker.send$(MATERIALIZED_VIEW_TOPIC, "DeviceConnected", msg)
      );
  }

  /**
   * Reaction to deviceofflineReported
   */
  handleDeviceDisconnectedEvent$(evt) {
    console.log("handleDeviceDisconnectedEvent", evt);
    return DeviceStatus.onDeviceOfflineReported(evt.aid)
    .map(results => results.filter(result => result._id.cuenca))    
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(msg =>
        broker.send$(MATERIALIZED_VIEW_TOPIC, "DeviceDisconnected", msg)
      );
  }

  /**
   * used to convert data to Online vs Offline schema.
   */
  mapToCharBarData$(devices) {
    return Rx.Observable.from(devices)
      .groupBy(cuenca => cuenca._id.cuenca)
      .mergeMap(group => group.toArray())
      .map(group => {        
        return {
          name: group[0]._id.cuenca,
          series: [
            {
              name: "Online",
              value: group.filter(c => c._id.online)[0]
                ? group.filter(c => c._id.online)[0].value
                : 0
            },
            {
              name: "Offline",
              value: group.filter(c => !c._id.online)[0]
                ? group.filter(c => !c._id.online)[0].value
                : 0
            }            
          ]
        };
      });
  }

  /**
   * 
   * @param {Object} array data with alarms info in range of times
   */
  mapToAlarmsWidget$(array) {
    const result = [];
    const timeRanges = ["ONE_HOUR", "TWO_HOURS", "THREE_HOURS"];
    array.forEach((item, index) => {
      result.push({
        timeRange: timeRanges[index],
        alarmsCount: item[0].value,
        devicesCount: item[0].informers,
        order: index,
        topDevices: item[0].topDevices,
        fullDevicesListLink: "htttp://www.google.com"
      });
    });
    return result;
  }

  /**
   * Reaction to  DeviceCpuUsageAlarmActivated
   * @param {Object} evt
   */
  DeviceCpuUsageAlarmActivated$(evt) {
    return this.getTimeRangesToLimit$(evt, "CPU_USAGE")
      .mergeMap(evt => AlarmReportDA.onDeviceCpuUsageAlarmActivated(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result, 3))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return { type: evt.alarmType, timeRanges: timeranges };
      })
      .mergeMap(msg =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "DeviceCpuUsageAlarmActivated",
          msg
        )
      );
  }

  /**
   * Reaction to Ram usage alarm
   */
  onDeviceRamuUsageAlarmActivated$(evt) {
    console.log(JSON.stringify(evt));
    return (
      this.getTimeRangesToLimit$(evt, "RAM_MEMORY")
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      // aca se esta desordenando el array 
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result, 3))  
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges
        };
      })
      .mergeMap(msg =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "DeviceRamMemoryAlarmActivated",
          msg
        )
        )
      );
  }

  /**
   * Reaction to DeviceTemperatureAlarmActivated event
   */
  onDeviceTemperatureAlarmActivated$(evt) {
    return this.getTimeRangesToLimit$(evt, "TEMPERATURE")
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result, 3))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges
        };
      })
      .mergeMap(msg =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "DeviceTemperatureAlarmActivated",
          msg
        )
      );
  }

  /**
   * gets array with datelimits in milliseconds to last one, two and three hours
   */
  getTimeRangesToLimit$(evt, eventType) {
    return Rx.Observable.of(evt).map(evt => {
      const now = new Date();
      const lastHourLimit = now - 3600000;
        // Date.now() - (now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const lastTwoHoursLimit = lastHourLimit - 3600000;
      const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
      evt.timeRanges = [lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit];
      evt.alarmType = eventType;
      return evt;
    });
  }


  /**
   * Reaction to Low Voltage alarm
   * @param {Object} evt 
   */
  handleDeviceLowVoltageAlarmEvent$(evt) {
    return this.getTimeRangesToLimit$(evt, "VOLTAGE")
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result, 3))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges
        };
      })
      .mergeMap(msg =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "DeviceLowVoltageAlarmReported",
          msg
        )
      );
  }

  /**
   * Reaction to High Voltage alarm
   * @param {Object} evt 
   */
  handleDeviceHighVoltageAlarmEvent$(evt) {
    return this.getTimeRangesToLimit$(evt, "VOLTAGE")
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result, 3))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges
        };
      })
      .mergeMap(msg =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "DeviceHighVoltageAlarmReported",
          msg
        )
      );
  }

  /**
   * gets the device transactions group by group name and time interval of 10 minutes
   * @param {*} param0
   * @param {*} authToken
   */
  getCuencaNamesWithSuccessTransactionsOnInterval$({ root, args, jwt }, authToken) {
    // console.log("------------ getCuencaNamesWithSuccessTransactionsOnInterval", args);
    return DeviceTransactionsDA
    .getCuencaNamesWithSuccessTransactionsOnInterval$(args.startDate, args.endDate)  
    .map(response => {
      const result = [];
      response.forEach(item => {
        result.push(item.name);
      });
      return result;
    });
  }

  /**
   * gets the device transactions group by time intervals of 10 minutes
   * @param {*} param0
   * @param {*} authToken
   */
  getDeviceTransactionsGroupByTimeInterval$({ root, args, jwt }, authToken) {
    // console.log("------------ getDeviceTransactionGroupByTimeInterval", args);
    return DeviceTransactionsDA.getDeviceTransactionGroupByTimeInterval$(
      args.startDate,
      args.endDate,
      args.groupName
    );
  }

  /**
   * 
   */
  getDeviceTransactionsGroupByGroupName$({ root, args, jwt }, authToken){
    // console.log(" ===> getDeviceTransactionsGroupByGroupName", args);
    return instance.getTimeRangesToLimit$({}, undefined)
    .mergeMap(evt => DeviceTransactionsDA.getDeviceTransactionGroupByGroupName$(evt))
  }

  /**
   * Persists the amount of successful transactions reported by a device with a timestamp
   * @param {*} data Reported transaction event
   */
  persistSuccessDeviceTransaction$(data) {
    // console.log("persistSuccessDeviceTransaction ==> ", data);
    return this.handleDeviceMainAppUsosTranspCountReported$(data, true);
  }

  /**
   * Persists the amount of failed transactions reported by a device with a timestamp
   * @param {*} data Reported transaction event
   */
  persistFailedDeviceTransaction$(data) {
    // console.log("persistFailedDeviceTransaction ==> ", data);
    return this.handleDeviceMainAppUsosTranspCountReported$(data, false);
  }

    /**
   * Persists the amount of transactions reported by a device with a timestamp
   * @param {*} data Reported transaction event
   * @param {*} success boolean that indicates if the transactions were failed or successful
   */
  handleDeviceMainAppUsosTranspCountReported$(data, success) {
    console.log("handleDeviceMainAppUsosTranspCountReported | aid ==>", data )
    return DeviceStatus.getDeviceStatusByID$(data.aid, { groupName: 1 })
    .do(d => console.log("deviceFound ==> ", d))
    .filter(device => device)
      .map(device => {
        const deviceTransaction = {
          deviceId: data.aid,
          timestamp: data.data.timestamp,
          value: data.data.count,
          success: success,
          groupName: device.groupName
        };
        return deviceTransaction;
      })
      .mergeMap(transaction =>
        DeviceTransactionsDA.insertDeviceTransaction$(transaction)
      )
      .throttleTime(15000)
      .map(deviceTransaction => {
        const deviceTransactionUpdatedEvent = {
          timestamp: new Date().getTime()
        };
        return deviceTransactionUpdatedEvent;
      })
      .mergeMap(deviceTransactionsUpdatedEvent => {
        return broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "deviceTransactionsUpdatedEvent",
          deviceTransactionsUpdatedEvent
        );
      });
  }

  /**
   * Update the device state in mongo collection
   * @param {Object} evt 
   */
  handleDeviceStateReportedEvent$(evt) {
    console.log("handleDeviceStateReportedEvent", evt);
    return DeviceStatus.onDeviceStateReportedEvent$(evt.data);
  }

  generateAlarms__RANDOM__$() {
    return AlarmReportDA.generateAlarms__RANDOM__();
  }

  generateDevices__RANDOM__$() {
    return DeviceStatus.generateDevices__RANDOM__$();
  }
}

module.exports = () => {
  if (!instance) {
    instance = new DashBoardDevices();
    console.log("DashBoardDevices Singleton created");
  }
  return instance;
};
