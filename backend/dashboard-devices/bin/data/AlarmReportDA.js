'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');

class AlarmReportDA {

    /**
     * gets DashBoardDevicesAlarmReport by type
     * @param {string} type 
     */
    static getDashBoardDevicesAlarmReport$(type) {        
        const collection = mongoDB.db.collection('AlarmReports');
        return Rx.Observable.fromPromise(collection.findOne({ type }));    
    }

}

module.exports = AlarmReportDA;