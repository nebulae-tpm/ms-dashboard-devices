'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');
const CollectionName = "AlarmReports";

class AlarmReportDA {

    /**
     * gets DashBoardDevicesAlarmReport by type
     * @param {string} type 
     */
    static getDashBoardDevicesAlarmReport$(type) {        
        const collection = mongoDB.db.collection(CollectionName);
        return Rx.Observable.fromPromise(collection.findOne({ type }));    
    }

}

module.exports = AlarmReportDA;