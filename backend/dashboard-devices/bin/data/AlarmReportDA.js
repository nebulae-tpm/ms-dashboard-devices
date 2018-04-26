'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');

class AlarmReportDA {

    /**
     * gets DashBoardDevicesAlarmReport by type
     * @param {string} type 
     */
    static getDashBoardDevicesAlarmReport$(type) {       
        // const collection = mongoDB.db.collection('AlarmReports');

        // return Rx.Observable.fromPromise(collection.findOne({ type }))
        // .mergeMap(())   

        const now = new Date();
        const lastHourLimit = ( Date.now() - ( ((now.getMinutes()* 60 ) + now.getSeconds() ) * 1000 ));
        const lastTwoHoursLimit = lastHourLimit - 3600000;
        const lastThreeHoursLimit = lastTwoHoursLimit - 3600000;
        const timeRanges = [ lastHourLimit, lastTwoHoursLimit, lastThreeHoursLimit ];
        return Rx.Observable.forkJoin(
            AlarmReportDA.getAlarmsInRangeOfTime(timeRanges[0], type ),
            AlarmReportDA.getAlarmsInRangeOfTime(timeRanges[1], type),
            AlarmReportDA.getAlarmsInRangeOfTime(timeRanges[2], type)
        );

    }
    /**
     * Add new registry on DeviceAlarmReport 
     * @param {Object} device 
     */
    static onDeviceCpuUsageAlarmActivated(evt){
        const collection = mongoDB.db.collection("DeviceAlarmReports");
        const alarmType = "CPU_USAGE";
        return Rx.Observable.fromPromise(collection.insertOne(
            {
                timestamp: evt.timestamp,
                type: alarmType,
                deviceId : evt.aid,
                value: evt.data.value,
                unit: evt.data.value
            }
        )).toArray()
        .do(r => console.log(r.result))
        .mergeMap(() => 
             Rx.Observable.forkJoin(
                AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[0], alarmType ),
                AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[1], alarmType),
                AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[2], alarmType)
            )          
        )
        
    }

    static onDeviceRamuUsageAlarmActivated$(evt){
        const collection = mongoDB.db.collection("DeviceAlarmReports");
        const alarmType = evt.alarmType;
        return Rx.Observable.fromPromise(collection.insertOne(
            {
                timestamp: evt.timestamp,
                type: alarmType,
                deviceId : evt.aid,
                value: evt.data.value,
                unit: evt.data.value
            }
        )).toArray()
        .mergeMap(() => 
             Rx.Observable.forkJoin(
                AlarmReportDA.getAlarmsInRangeOfTime(evt.timeRanges[0], alarmType ),
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
    static getAlarmsInRangeOfTime(lowestLimit, alarmType){
        const collection = mongoDB.db.collection("DeviceAlarmReports");
        return Rx.Observable.fromPromise(collection
            .aggregate([
              { $match: { timestamp: { $gte: lowestLimit }, type: alarmType } },
              {
                $group: {
                  _id: "$type",
                  value: { $sum: 1 }
                }
              }
            ])
            .toArray());
    }

    static getTopAlarmDevices$(timeRange, lowestLimit, alarmType, topLimit){
        const collection = mongoDB.db.collection("DeviceAlarmReports");
        return Rx.Observable.fromPromise(collection
            .aggregate([
              { $match: { timestamp: { $gte: lowestLimit }, type: alarmType } },
              {
                $group: {
                  _id: {type: "$type", deviceId : "$deviceId"} ,
                  value: { $sum: 1 }
                }
              },
              { $sort: { "_id.device": -1 } },
              { $limit: topLimit }
            ])            
            .toArray())
            // .mergeMap(result => {
            //     timeRange.topDevices = result;
            //     return timeRange;
            // })
            .map(() =>  timeRange)
            .do(r => console.log("=======> ", JSON.stringify(r)))
    }

    static generateAlarms__RANDOM__(){
        
        const collection = mongoDB.db.collection("DeviceAlarmReports");
        const types = ["VOLTAGE", "TEMPERATURE", "CPU_USAGE", "RAM_MEMORY"];
        const units = ["V", "C", "%", "%"];
        const selection = Math.floor((Math.random() * 4) );
        return Rx.Observable.fromPromise(collection.insertOne(
            {
                timestamp: Date.now(),
                type: types[selection],
                deviceId : `sn00${Math.floor((Math.random() * 10) )}-000${Math.floor((Math.random() * 9) )}-TEST`,
                value: Math.floor((Math.random() * 100) + 5 ),
                unit: units[selection]
            }
        ));
    }

}

module.exports = AlarmReportDA;