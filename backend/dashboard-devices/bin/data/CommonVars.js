"use strict";

const mongoDB = require("./MongoDB")();
const Rx = require("rxjs");
const CollectionName = "CommonVariables";

class CommonVarsDA {
  static getVarValue$(keyVar) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.findOne({ key: keyVar }, {value: 1}));
  }

  static updateVarValue$(variable){
    return this.updateOne$(
        { key: variable.key },
        { $set: { value: variable.value } },
        { upsert: true }
    );
  }


  static updateOne$(filter, update, options) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.updateOne(filter, update, options));
  }
}

module.exports = CommonVarsDA;
