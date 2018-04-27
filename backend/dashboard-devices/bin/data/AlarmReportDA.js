'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');

class AlarmReportDA {
  /**
   * gets DashBoardDevicesAlarmReport by type
   * @param {string} type
   */
  static getDashBoardDevicesAlarmReport$(type) {

    const now = new Date();
    const lastHourLimit =
      Date.now() - (now.getMinutes() * 60 + now.getSeconds()) * 1000;
    const lastTwoHoursLimit = lastHourLimit - 3600000;
    const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
    const timeRanges = [lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit];
    return Rx.Observable.forkJoin(
      AlarmReportDA.getAlarmsInRangeOfTime(timeRanges[0], type),
      AlarmReportDA.getAlarmsInRangeOfTime(timeRanges[1], type),
      AlarmReportDA.getAlarmsInRangeOfTime(timeRanges[2], type)
    );
  }
  /**
   * Add new registry on DeviceAlarmReport
   * @param {Object} device
   */
  static onDeviceCpuUsageAlarmActivated(evt) {
    const collection = mongoDB.db.collection("DeviceAlarmReports");
    const alarmType = "CPU_USAGE";
    return Rx.Observable.fromPromise(
      collection.insertOne({
        timestamp: evt.timestamp,
        type: alarmType,
        deviceId: evt.aid,
        value: evt.data.value,
        unit: evt.data.value
      })
    )
      .toArray()
      .mergeMap(() =>
        Rx.Observable.forkJoin(
          AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[0], alarmType),
          AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[1], alarmType),
          AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[2], alarmType)
        )
      );
  }

  /**
   * Save the alarm document in mongo
   * @param {Object} evt 
   */
  static onDeviceAlarmActivated$(evt) {
    const collection = mongoDB.db.collection("DeviceAlarmReports");
    const alarmType = evt.alarmType;
    return Rx.Observable.fromPromise(
      collection.insertOne({
        timestamp: evt.timestamp,
        type: alarmType,
        deviceId: evt.aid,
        value: evt.data.value,
        unit: evt.data.value
      })
    )
    // get the information of alerts in frames for lastHour, lastTwohours, lastThreeHours
    .mergeMap(() =>
        Rx.Observable.forkJoin(
          AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[0], alarmType),
          AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[1], alarmType),
          AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[2], alarmType)
        )
      )
  }
  /**
   * get the number of alerts
   * @param {number} limit lowest date in millis to fecth alerts
   * @param {string} type of alert
   */
  static getAlarmsInRangeOfTime(lowestLimit, alarmType) {
    const collection = mongoDB.db.collection("DeviceAlarmReports");
    return Rx.Observable.fromPromise(
      collection
        .aggregate([
          { $match: { timestamp: { $gte: lowestLimit }, type: alarmType } },
          {
            $group: {
              _id: "$type",
              value: { $sum: 1 }
            }
          }
        ])
        .toArray()
    )
    .map(item => {
      item[0].startTime = lowestLimit;
      item[0].alarmType = alarmType;
      return item;
    })
  }

  /**
   * 
   * @param {Object} timeRanges contains the information to show in the card about just one frame hour 
   * @param {int} topLimit Top devices  limit
   */
  static getTopAlarmDevices$(timeRanges, topLimit) {
    const collection = mongoDB.db.collection("DeviceAlarmReports");
    return Rx.Observable.from(timeRanges)
    .mergeMap(timeRange => {
      return (
      Rx.Observable.fromPromise(
        collection
          .aggregate([
            { $match: { timestamp: { $gte: timeRange[0].startTime }, type: timeRange[0].alarmType } },
            {
              $group: {
                _id: { type: "$type", deviceId: "$deviceId" },
                value: { $sum: 1 }
              }
            },
            { $sort: { "value": -1 } },
            { $limit: topLimit }
          ])
          .toArray()
      )
      .map(aggregateResult => {
        const result =[];
        aggregateResult.forEach((item, index) => {
          result.push({
            sn: item._id.deviceId,
            hostname: "Santa",
            alarmsCount: item.value,
            aggregateResult: "www.google.com"
          })
        });
        return result;
      })
      .map(aggregateResult => {
        timeRange[0].topDevices = aggregateResult; 
        return timeRange;
      })      
    );
    } )
    .toArray();
  }

  static generateAlarms__RANDOM__() {
    const collection = mongoDB.db.collection("DeviceAlarmReports");
    const types = ["VOLTAGE", "TEMPERATURE", "CPU_USAGE", "RAM_MEMORY"];
    const units = ["V", "C", "%", "%"];
    const selection = Math.floor(Math.random() * 4);
    return Rx.Observable.fromPromise(
      collection.insertOne({
        timestamp: Date.now(),
        type: types[selection],
        deviceId: `sn00${Math.floor(Math.random() * 10)}-000${Math.floor(
          Math.random() * 9
        )}-TEST`,
        value: Math.floor(Math.random() * 100 + 5),
        unit: units[selection]
      })
    );
  }

  static calculateTimeRanges$(evt) {
    const collection = mongoDB.db.collection("DeviceAlarmReports");
    return Rx.Observable.fromPromise(collection
        .aggregate([
          { $match: { type: evt.data.alarmType } },
          {
            $project: {
              date: { $add: [new Date(0), "$timestamp"] },
              timestamp: 1,
              deviceId: 1
            }
          },
          {
            $group: {
              _id: {
                year: { $year: { date: "$date", timezone: "-0500" } },
                month: { $month: { date: "$date", timezone: "-0500" } },
                interval: {
                  $subtract: [
                    { $minute: { date: "$date", timezone: "-0500" } },
                    { $mod: [{ $minute: new Date(1524779294) }, 40] }
                  ]
                }
              },
              grouped_data: {
                $push: { timestamp: "$timestamp", value: "$deviceId" }
              }
            }
          },
          { $limit: 1 }
        ])
        .toArray());
  }
}

module.exports = AlarmReportDA;