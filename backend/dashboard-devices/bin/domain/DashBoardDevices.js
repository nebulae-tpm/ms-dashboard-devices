'use strict'

const Rx = require('rxjs');

class DashBoardDevices {
    constructor() {
    }

    static find({root,args,jwt}) {
        return Rx.Observable.of({ id: 1, firstName: 'aaa', lastName: 'bbb' });
    }
}

module.exports = DashBoardDevices;