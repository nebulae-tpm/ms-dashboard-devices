"use strict";

const mongoDB = require("./MongoDB")();
const Rx = require("rxjs");
const CollectionName = "deviceState";

class DeviceStatusDA {
  /**
   * gets DashboardDeviceStatus by sn
   * @param {string} type
   */
  static getDashBoardDevicesStatus$(sn, hostname) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.fromPromise(collection.findOne({ sn }));
  }
  /**
   * Updates the device state in DB and gets the new data for front-end chart interested
   * @param {String} sn device sn to update the state in DB
   */
  static onDeviceOnlineReported(device) {
    return this.updateOne$(
      { sn: device.sn },
      { $set: { online: true } }
    ).mergeMap((updateResult) =>  this.getTotalDeviceByCuencaAndNetworkState$());
  }

  static onDeviceOfflineReported(device){
    return this.updateOne$(
      { sn: device.sn },
      { $set: { online: false } }
    ).mergeMap((r) => this.getTotalDeviceByCuencaAndNetworkState$()
    );
  }
  
  /**
   * Search and using aggregate counts the total devices per cuenca with
   *  networkState condition
   */
  static getTotalDeviceByCuencaAndNetworkState$() {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.fromPromise(
      collection
        .aggregate([
          { $match: { active: true } },
          {
            $group: {
              _id: { cuenca: "$cuenca", online: "$online" },
              value: { $sum: 1 }   
            }            
          },
          { $sort: { _id: 1 } }
        ])
        .toArray()
    );
  }
  /**
   * Updates a document in the collection
   * @param {object} filter The selection criteria for the update. The same query selectors as in the find() method are available.
   * @param {object} update The modifications to apply.
   * @param {object} options Optional update query
   */
  static updateOne$(filter, update, options) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.fromPromise(
      collection.updateOne(filter, update, options)
    );
  }


  static generateDevices__RANDOM__$(){
        
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.fromPromise(collection.insertOne(
        {
            active: false,
            deviceId : `sn00${Math.floor((Math.random() * 10) )}-000${Math.floor((Math.random() * 9) )}-TEST`,
            hostname: `ABC${Math.floor((Math.random() * 999 ) + 100 )}`,
            cuenca: `Cuenca${Math.floor((Math.random() * 5) + 1)}`,
            online: true,
            ramMemoryAlert: true,
            cpuAlert: true,
            temperatureAlert: true,
            voltageAlert: true
        }
    ));
}
  
}

module.exports = DeviceStatusDA;
