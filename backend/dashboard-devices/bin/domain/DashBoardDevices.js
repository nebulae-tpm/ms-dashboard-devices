'use strict'

const Rx = require('rxjs');
const AlarmReportDA = require('../data/AlarmReportDA');

class DashBoardDevices {
    constructor() {
    }

    getDashBoardDevicesAlarmReport({ root, args, jwt }, authToken) {        
        return AlarmReportDA.getDashBoardDevicesAlarmReport$(args.type);
    }


}

module.exports = DashBoardDevices;