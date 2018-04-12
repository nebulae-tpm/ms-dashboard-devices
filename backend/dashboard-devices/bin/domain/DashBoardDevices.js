'use strict'

const Rx = require('rxjs');

class DashBoardDevices {
    constructor() {
    }

    getDashBoardDevicesAlarmReport({ root, args, jwt }, authToken) {
        return Rx.Observable.of({
            type: 'RAM_MEMORY',
            timeRanges: [
                {
                    timeRange: 'ONE_HOUR',
                    alarmsCount: 123,
                    devicesCount: 321,
                    order: 0,
                    topDevices: [
                        {
                            sn: '87654',
                            hostname: 'myName',
                            alarmsCount: 12,
                            deviceDetailLink: 'htttp://www.google.com/87654'

                        }
                    ],
                    fullDevicesListLink: 'htttp://www.google.com'
                }
            ]
        });
    }
}

module.exports = DashBoardDevices;