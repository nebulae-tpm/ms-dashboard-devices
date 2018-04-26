"use strict";

const Rx = require("rxjs");
const AlarmReportDA = require("../data/AlarmReportDA");
const DeviceStatus = require("../data/DevicesStatusDA");
const broker = require("../tools/broker/BrokerFactory.js")();

let instance;

class DashBoardDevices {
  constructor() {}

  /**
   * give data to the Dashborad CPU alarm widget
   * @param {*} param0 
   * @param {*} authToken 
   */
  getDashBoardDevicesAlarmReport({ root, args, jwt }, authToken) {
    console.log("getDashBoardDevicesAlarmReport");
    return AlarmReportDA.getDashBoardDevicesAlarmReport$(args.type)
    .mergeMap(array => instance.mapToAlarmsWidget$(array) )
    .toArray()
    .map(timeranges => {
      return {
        type: args.type ,
        timeRanges: timeranges
      }
    })
    
  }

  getDashBoardDeviceDeviceState({ root, args, jwt }, authToken) {
    return DeviceStatus.getDashBoardDevicesStatus$(args.snDevice);
  }

  updateDeviceNetworkStatus({ root, args, jwt }, authToken) {
    console.log("on updateDeviceNetworkStatus ...", root, args);
    return DeviceStatus.getDashBoardDevicesStatus$("2526");
  }

  /**
   * Get the current device on Vs device off chart status
   * @param {*} param0
   * @param {*} authToken
   */
  getDashBoardDevicesCurrentNetworkStatus({ root, args, jwt }, authToken) {
    console.log("getDashBoardDevicesCurrentNetworkStatus ..", root, args);
    // return DeviceStatus.getTotalDeviceByCuencaAndNetworkState$()
    // .mergeMap(response => this.mapToCharBarData$(response))
    return DeviceStatus.getTotalDeviceByCuencaAndNetworkState$()
    .mergeMap(devices => instance.mapToCharBarData$(devices))
    .toArray();
  }

  /**
   * Reaction to deviceOnlineReported
   */
  onDeviceOnlineReported$(event) {
    console.log(event.data.device);
    return DeviceStatus.onDeviceOnlineReported(event.data.device)
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(msg =>
        broker.send$("MaterializedViewUpdates", "DeviceConnected", msg)
      );
  }

  /**
   * Reaction to deviceofflineReported
   */
  onDeviceDisconnected$(event) {
    return DeviceStatus.onDeviceOfflineReported(event.data.device)
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
        console.log(group);
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

  mapToAlarmsWidget$(array){
    const result = [];
      const timeRanges = ["ONE_HOUR", "TWO_HOURS", "THREE_HOURS"];      
      array.forEach((item, index) => {
        result.push({
          timeRange: timeRanges[index],
          alarmsCount: item[0].value,
          devicesCount: 321,
          order: index,
          topDevices: [],          
          fullDevicesListLink: "htttp://www.google.com"
        });
      })
      return result;    
  }

 /**
  * Reaction to  DeviceCpuUsageAlarmActivated
  * @param {Object} evt 
  */
  DeviceCpuUsageAlarmActivated$(evt){
    const alarmType = 'CPU_USAGE';
    const now = new Date();
    const lastHourLimit = ( Date.now() - ( ((now.getMinutes()* 60 ) + now.getSeconds() ) * 1000 ));
    const lastTwoHoursLimit = lastHourLimit - 3600000;
    const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
    evt.timeRanges = [ lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit ];
    console.log(evt);  
    return AlarmReportDA.onDeviceCpuUsageAlarmActivated(evt)
    .mergeMap(array => this.mapToAlarmsWidget$(array))
    .toArray()
    .map(timeranges => {
      return {
        type: alarmType ,
        timeRanges: timeranges
      }
    })
    .do(r => console.log(JSON.stringify(r)))
    .mergeMap(msg =>
      broker.send$("MaterializedViewUpdates", "DeviceCpuUsageAlarmActivated", msg)
    );
  }

  /**
   * 
   */
  onDeviceRamuUsageAlarmActivated$(evt){
    const now = new Date();
    const lastHourLimit = ( Date.now() - ( ((now.getMinutes()* 60 ) + now.getSeconds() ) * 1000 ));
    const lastTwoHoursLimit = lastHourLimit - 3600000;
    const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
    evt.timeRanges = [ lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit ];
    evt.alarmType = 'RAM_MEMORY';
    console.log(evt);  
    return AlarmReportDA.onDeviceRamuUsageAlarmActivated$(evt)
    .mergeMap(array => this.mapToAlarmsWidget$(array))
    .toArray()
    .map(timeranges => {
      return {
        type: evt.alarmType,
        timeRanges: timeranges
      }
    })
    .do(r => console.log(JSON.stringify(r)))
    .mergeMap(msg =>
      broker.send$("MaterializedViewUpdates", "DeviceRamMemoryAlarmActivated", msg)
    );
  }

  /**
   * Reaction to DeviceTemperatureAlarmActivated event
   */
  onDeviceTemperatureAlarmActivated$(evt){
    const now = new Date();
    const lastHourLimit = ( Date.now() - ( ((now.getMinutes()* 60 ) + now.getSeconds() ) * 1000 ));
    const lastTwoHoursLimit = lastHourLimit - 3600000;
    const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
    evt.timeRanges = [ lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit ];
    evt.alarmType = 'TEMPERATURE';
    console.log(evt);  
    return AlarmReportDA.onDeviceRamuUsageAlarmActivated$(evt)
    .mergeMap(array => this.mapToAlarmsWidget$(array))
    .toArray()
    .map(timeranges => {
      return {
        type: evt.alarmType,
        timeRanges: timeranges
      }
    })
    .do(r => console.log(JSON.stringify(r)))
    .mergeMap(msg =>
      broker.send$("MaterializedViewUpdates", "DeviceTemperatureAlarmActivated", msg)
    );
  }

 
  

  generateAlarms__RANDOM__$(){
    return AlarmReportDA.generateAlarms__RANDOM__()
  }

  generateDevices__RANDOM__$(){
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
