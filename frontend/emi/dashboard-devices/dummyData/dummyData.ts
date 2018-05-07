export class DummyReportData {
  timestamp: number;
  deviceId: string;
  deviceCuencaName: string;
  totalUses: number;
  totalWriteErrors: number;
  cpuUsage: number;
  vehiclePlate: string;

  constructor(
    timestamp,
    deviceId,
    deviceCuencaName,
    totalUses,
    totalWriteErrors,
    cpuUsage,
    vehiclePlate
  ) {
    this.timestamp = timestamp;
    this.deviceId = deviceId;
    this.deviceCuencaName = deviceCuencaName;
    this.totalUses = totalUses;
    this.totalWriteErrors = totalWriteErrors;
    this.cpuUsage = cpuUsage;
    this.vehiclePlate = vehiclePlate;
  }
}

export class DummyDevice {
  deviceId: string;

  constructor(){
    this.deviceId = Math.floor((Math.random() * 100000) + 1).toString();
  }
}


export class DummyCuenca {


  name: string;
  constructor(){
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
     'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
      'T', 'U', 'V', 'W', 'Y', 'Z'];
    this.name = 'Cuenca-' + letters[Math.floor((Math.random() * 24 ) + 1)]
                          + letters[Math.floor((Math.random() * 24 ) + 1)]
                          + Math.floor((Math.random() * 1000) + 1);
  }

}

export class DummyVehicle {

  plate: string;

  constructor(){
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
     'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
      'T', 'U', 'V', 'W', 'Y', 'Z'];
      this.plate = letters[Math.floor((Math.random() * 24 ) + 1)]
                 + letters[Math.floor((Math.random() * 24 ) + 1)]
                 + letters[Math.floor((Math.random() * 24 ) + 1)]
                 + Math.floor((Math.random() * 9 ) + 1)
                 + Math.floor((Math.random() * 9 ) + 1)
                 + Math.floor((Math.random() * 9 ) + 1);
  }

}

export class DataWidget7 {
  interval: number;
  groupName: string;
  transactions: number;
  errors: number;

  constructor(
    interval: number,
    groupName: string,
    transactions: number,
    errors: number
  ) {
    this.interval = interval;
    this.groupName = groupName;
    this.transactions = transactions;
    this.errors = errors;
  }
}

