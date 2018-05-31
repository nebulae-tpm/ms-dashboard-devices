"use strict";

const Rx = require("rxjs");
const AlarmReportDA  = require("../data/AlarmReportDA");
const { CustomError } = require("../tools/customError");
const DeviceStatus = require("../data/DevicesStatusDA");
const DeviceTransactionsDA = require("../data/DeviceTransactionsDA");
const broker = require("../tools/broker/BrokerFactory.js")();

const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";

let instance;

class DashBoardDevices {
  constructor() {
    this.frontendDeviceTransactionsUpdatedEvent$ = new Rx.Subject();

    this.frontendDeviceTransactionsUpdatedEvent$
      .throttleTime(60000)
      .subscribe((deviceTransactionsUpdatedEvent) => {
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "deviceTransactionsUpdatedEvent",
          deviceTransactionsUpdatedEvent
        ).subscribe(
          (result) => { console.log("Update transaction sent to front-end", result) },
          (err) => { console.log(err) },
          () => { }
        )
      },
        (error) => { },
        () => { }
      )
  }

  /**
   * delivers the current status of the alarm by type
   * @param {*} param0
   * @param {*} authToken
   */
  getDashBoardDevicesAlarmReport$({ root, args, jwt }, authToken) {
    // console.log("getDashBoardDevicesAlarmReport", args);
    return this.getTimeRangesToLimit$({}, args.type, args.startTime)
      .mergeMap(result =>
        AlarmReportDA.getDashBoardDevicesAlarmReport$(result)
      )
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result))
      // since here the client can do it.
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        // console.log(JSON.stringify(timeranges));
        return {
          type: args.type,
          queriedTime: args.startTime,
          timeRanges: timeranges
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  /**
   * Get the current device on Vs device off chart status
   * @param {*} param0
   * @param {*} authToken
   */
  getDashBoardDevicesCurrentNetworkStatus$({ root, args, jwt }, authToken) {
    // console.log("getDashBoardDevicesCurrentNetworkStatus ..", root, args);
    return DeviceStatus.getTotalDeviceByCuencaAndNetworkState$()
      .map(results => results.filter(result => result._id.cuenca))
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  /**
   *  Get the Devices count
   */
  getDeviceDashBoardTotalAccount$({ root, args, jwt }, authToken) {
    // console.log("getDashBoardDevicesCurrentNetworkStatus ..", root, args);
    return DeviceStatus.getDevicesTotalAccount$()
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
  }

  /**
   * Reaction to deviceOnlineReported
   */
  handleDeviceConnectedEvent$(evt) {
    // console.log("handleDeviceConnectedEvent", evt, evt.aid);
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
    // console.log("handleDeviceDisconnectedEvent", evt);
    return DeviceStatus.onDeviceOfflineReported(evt.aid)
      .map(results => results.filter(result => result._id.cuenca))
      .mergeMap(devices => this.mapToCharBarData$(devices))
      .toArray()
      .mergeMap(msg =>
        broker.send$(MATERIALIZED_VIEW_TOPIC, "DeviceDisconnected", msg)
      );
  } 

  /**
   * Reaction to  DeviceCpuUsageAlarmActivated
   * @param {Object} evt
   */
  DeviceCpuUsageAlarmActivated$(evt) {
    const queriedTime = Date.now();
    return this.getTimeRangesToLimit$(evt, "CPU_USAGE", queriedTime)
      .mergeMap(evt => this.fillHostnameToEvt$(evt))
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return { type: evt.alarmType, timeRanges: timeranges, queriedTime: queriedTime };
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
    const queriedTime = Date.now();
    return this.getTimeRangesToLimit$(evt, "RAM_MEMORY", queriedTime)
        .mergeMap(evt => this.fillHostnameToEvt$(evt))
        .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
        // aca se estaba desordenando el array
        .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result))
        .mergeMap(array => this.mapToAlarmsWidget$(array))
        .toArray()
        .map(timeranges => {
          return {
            type: evt.alarmType,
            timeRanges: timeranges,
            queriedTime: queriedTime
          };
        })
        .mergeMap(msg =>
          broker.send$(
            MATERIALIZED_VIEW_TOPIC,
            "DeviceRamMemoryAlarmActivated",
            msg
          )
        );
  }

  /**
   * Reaction to DeviceTemperatureAlarmActivated event
   */
  onDeviceTemperatureAlarmActivated$(evt) {
    const queriedTime = Date.now();
    return this.getTimeRangesToLimit$(evt, "TEMPERATURE", queriedTime )
      .mergeMap(evt => this.fillHostnameToEvt$(evt))
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges,
          queriedTime: queriedTime
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
   * Reaction to Low Voltage alarm
   * @param {Object} evt
   */
  handleDeviceLowVoltageAlarmEvent$(evt) {
    const queriedTime = Date.now();
    return this.getTimeRangesToLimit$(evt, "VOLTAGE", queriedTime)
      .mergeMap(evt => this.fillHostnameToEvt$(evt))
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges,
          queriedTime: queriedTime
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
    const queriedTime = Date.now();
    return this.getTimeRangesToLimit$(evt, "VOLTAGE", queriedTime)
      .mergeMap(evt => this.fillHostnameToEvt$(evt))
      .mergeMap(evt => AlarmReportDA.onDeviceAlarmActivated$(evt))
      .mergeMap(result => AlarmReportDA.getTopAlarmDevices$(result))
      .mergeMap(array => this.mapToAlarmsWidget$(array))
      .toArray()
      .map(timeranges => {
        return {
          type: evt.alarmType,
          timeRanges: timeranges,
          queriedTime : queriedTime
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
  getCuencaNamesWithSuccessTransactionsOnInterval$(
    { root, args, jwt },
    authToken
  ) {
    // console.log("------------ getCuencaNamesWithSuccessTransactionsOnInterval", args);
    return DeviceTransactionsDA.getCuencaNamesWithSuccessTransactionsOnInterval$(
      args.startDate,
      args.endDate
    ).map(response => {
      const result = [];
      response.forEach(item => {
        result.push(item.name);
      });
      return result;
    })
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
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
    )
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
  }

  /**
   *
   */
  getDeviceTransactionsGroupByGroupName$({ root, args, jwt }, authToken) {
    // console.log(" ===> getDeviceTransactionsGroupByGroupName", args);
    return this
      .getTimeRangesRoundedToLimit$({}, undefined, args.nowDate)
      .mergeMap(evt =>
        DeviceTransactionsDA.getDeviceTransactionGroupByGroupName$(evt)
      )
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));

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
    // console.log("handleDeviceMainAppUsosTranspCountReported | aid ==>", success, data )

    return (
      DeviceStatus.getDeviceStatusByID$(data.aid, { groupName: 1 })
        // .do(d => console.log("deviceFound ==> ", d.deviceId))
        .filter(device => device)
        .map(device => {
          const deviceTransaction = {
            deviceId: data.aid,
            timestamp: data.data.timestamp,
            value: data.data.count,
            success: success,
            groupName: device.groupName ? device.groupName : "__Cuenca__"
          };
          return deviceTransaction;
        })
        .mergeMap(transaction =>
          DeviceTransactionsDA.insertDeviceTransaction$(transaction)
        )               
        .map(deviceTransaction => {
          const deviceTransactionUpdatedEvent = {
            timestamp: new Date().getTime()
          };
          return deviceTransactionUpdatedEvent;          
        })
        // TODO check what is the best way to do this
        .do((deviceTransactionUpdatedEvent) => this.frontendDeviceTransactionsUpdatedEvent$.next(deviceTransactionUpdatedEvent))
       
    );
  }

  /**
   * Update the device state in mongo collection
   * @param {Object} evt
   */
  handleDeviceStateReportedEvent$(evt) {
    // console.log("handleDeviceStateReportedEvent", evt);
    return DeviceStatus.onDeviceStateReportedEvent$(evt.data);
  }

  /**
   * 
   */
  removeAllObsoleteMongoDocuments$(evt){
    console.log("removeAllObsoleteMongoDocuments ==> ", evt.data)
    const hoursBefore = evt.data.obsoleteThreshold;
    const obsoleteThreshold = ( Date.now() - (hoursBefore * 60 * 60 * 1000) + ( 10 * 60 * 1000 ) );
    return Rx.Observable.forkJoin(
      AlarmReportDA.removeObsoleteAlarmsReports$(obsoleteThreshold),
      DeviceTransactionsDA.removeObsoleteTransactions$(obsoleteThreshold)
    );
  }

  

  errorHandler$(err){
    const exception = { data: null, result: { code: err.code } }; 
    if(err instanceof CustomError ){      
      exception.result.error = err.getContent();      
    }else{
      exception.result.error = {
        name: this.name,
        code: "000-001",
        msg: err.toString(),
        // stack: err.stack
      }      
    }
    return Rx.Observable.of(exception);    
  }

  //#region Mappers
  buildSuccessResponse$(rawRespponse) {
    return Rx.Observable.of(rawRespponse)
      .map(resp => {
        return {
          data: resp,
          result: {
            code: 200
          }
        }
      });
  }

    /**
   * get device's hostname using deviceId to query for it in mongo and persist
   * the alarm registry with hostname property.
   * @param {evt} evt
   */
  fillHostnameToEvt$(evt) {
    return Rx.Observable.forkJoin(
      Rx.Observable.of(evt),
      DeviceStatus.getDeviceStatusByID$(evt.aid, { hostname: 1 })
    )
      .filter(([evt, device]) => device)
      .map(([evt, device]) => {
        evt.device = device;
        return evt;
      });
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
   * gets array with datelimits in milliseconds to last one, two and three hours
   */
  getTimeRangesToLimit$(evt, eventType, startDate) {
    return Rx.Observable.of(evt).map(evt => {
      const startTime = startDate ? startDate : Date.now();
      const lastHourLimit = startTime - 3600000;
      // const lastHourLimit = Date.now() - (now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const lastTwoHoursLimit = lastHourLimit - 3600000;
      const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
      evt.timeRanges = [lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit];
      evt.alarmType = eventType;
      return evt;
    });
  }

  /**
   * gets array with datelimits in milliseconds to last one, two and three hours
   */
  getTimeRangesRoundedToLimit$(evt, eventType, dateNow) {
    // console.log("--getTimeRangesRoundedToLimit$", evt, eventType, dateNow );
    return Rx.Observable.of(evt).map(evt => {
      const now = new Date(dateNow);
      now.setMinutes(now.getMinutes() - now.getMinutes() % 10, 0, 0);
      const lastHourLimit = now - 3600000;
      // const lastHourLimit = Date.now() - (now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const lastTwoHoursLimit = lastHourLimit - 3600000;
      const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
      evt.timeRanges = [lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit];
      evt.timeRangesLabel = [
        lastHourLimit + "," + now.getTime(),
        lastTwoHoursLimit + "," + now.getTime(),
        lastThreeHoursLimit + "," + now.getTime()
      ];
      evt.alarmType = eventType;
      evt.endTimeLimit = now.getTime();
      return evt;
    });
  }
  //endregion

  //#region random data generator

  generateAlarms__RANDOM__$() {
    return AlarmReportDA.generateAlarms__RANDOM__();
  }

  generateDevices__RANDOM__$() {
    return DeviceStatus.generateDevices__RANDOM__$();
  }

  //#endregion 
  
}

module.exports = () => {
  if (!instance) {
    instance = new DashBoardDevices();
    console.log("DashBoardDevices Singleton created");
  }
  return instance;
};
