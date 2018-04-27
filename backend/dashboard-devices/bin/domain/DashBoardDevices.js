"use strict";

const Rx = require("rxjs");
const AlarmReportDA = require("../data/AlarmReportDA");
const DeviceStatus = require("../data/DevicesStatusDA");
const broker = require("../tools/broker/BrokerFactory.js")();

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
    return AlarmReportDA.getDashBoardDevicesAlarmReport$(args.type)
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
      .mergeMap(devices => instance.mapToCharBarData$(devices))
      .toArray();
  }

  /**
   * Reaction to deviceOnlineReported
   */
  handleDeviceConnectedEvent$(evt) {
    console.log("handleDeviceConnectedEvent", evt);
    return DeviceStatus.onDeviceOnlineReported(evt.aid)
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(msg =>
        broker.send$("MaterializedViewUpdates", "DeviceConnected", msg)
      );
  }

  /**
   * Reaction to deviceofflineReported
   */
  handleDeviceDisconnectedEvent$(evt) {
    console.log("handleDeviceDisconnectedEvent", evt);
    return DeviceStatus.onDeviceOfflineReported(evt.aid)
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(msg =>
        broker.send$("MaterializedViewUpdates", "DeviceDisconnected", msg)
      );
  }

  mapToCharBarData$(devices) {
    return Rx.Observable.from(devices)
      .groupBy(cuenca => cuenca._id.cuenca)
      .mergeMap(group => group.toArray())
      .map(group => {
        return {
          name: group[0]._id.cuenca,
          series: [
            {
              name: "Offline",
              value: group.filter(c => !c._id.online)[0].value || 0
            },
            {
              name: "Online",
              value: group.filter(c => c._id.online)[0].value || 0
            }
          ]
        };
      });
  }

  mapToAlarmsWidget$(array) {
    const result = [];
    const timeRanges = ["ONE_HOUR", "TWO_HOURS", "THREE_HOURS"];
    array.forEach((item, index) => {
      result.push({
        timeRange: timeRanges[index],
        alarmsCount: item[0].value,
        devicesCount: 321,
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
          "MaterializedViewUpdates",
          "DeviceCpuUsageAlarmActivated",
          msg
        )
      );
  }

  /**
   * Reaction to Ram usage alarm
   */
  onDeviceRamuUsageAlarmActivated$(evt) {
    return this.getTimeRangesToLimit$(evt, "RAM_MEMORY")
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .do( r => console.log("===> ", r, "<==="))
      // aca se esta desordenando el array 
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result, 3))  
      .do(r => console.log("===> ", r, "<==="))
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
          "MaterializedViewUpdates",
          "DeviceRamMemoryAlarmActivated",
          msg
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
          "MaterializedViewUpdates",
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
      const now = new Date(1524864521082);
      const lastHourLimit =
      new Date(1524864521082) - (now.getMinutes() * 60 + now.getSeconds()) * 1000;
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
          "MaterializedViewUpdates",
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
          "MaterializedViewUpdates",
          "DeviceHighVoltageAlarmReported",
          msg
        )
      );

    // return this.getTimeRangesToLimit$(evt, "VOLTAGE")
    //   .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
    //   .mergeMap(array => this.mapToAlarmsWidget$(array))
    //   .toArray()
    //   .map(timeranges => {
    //     return {
    //       type: evt.alarmType,
    //       timeRanges: timeranges
    //     };
    //   })
    //   .mergeMap(msg =>
    //     broker.send$(
    //       "MaterializedViewUpdates",
    //       "DeviceHighVoltageAlarmReported",
    //       msg
    //     )
    //   );
  }
  /**
   * Update the device state in mongo collection
   * @param {Object} evt 
   */
  handleDeviceStateReportedEvent$(evt) {
    console.log("handleDeviceStateReportedEvent", evt);
   return  DeviceStatus.onDeviceStateReportedEvent$(evt.data)
   .map(r => "");
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
