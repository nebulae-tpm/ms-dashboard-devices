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
  online: boolean;
  SN: string;
  hostname: String;
  cuenca: string;
  lastConection: number;
  cpu: number;
  ram: number;

  constructor(SN: string,
    hostname: String,
    cuenca: string,
    lastConection: number,
    cpu: number,
    ram: number){
      this.SN = SN;
      this.hostname = hostname;
      this.cuenca = cuenca;
      this.lastConection = lastConection;
      this.cpu = cpu;
      this.ram = ram;
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

export class DummySN {
  SN: string;


  constructor() {
    const versions = ['ONZ', 'VOC'];
    this.SN = versions[Math.floor((Math.random() * 2 ))]
      + Math.floor((Math.random() * 9 ) + 1)
      + Math.floor((Math.random() * 9 ) + 1)
      + Math.floor((Math.random() * 9 ) + 1);
  }

}


export class DummyTransactionPack {
  device: DummyDevice;
  initTime: number;
  endTime: number;
  usages: number;
  writeErrors: number;

  constructor (device: DummyDevice, initTime: number, endTime: number, usages: number, writeErrors: number) {
    this.device = device;
    this.initTime = initTime;
    this.endTime = endTime;
    this.usages = usages;
    this.writeErrors = writeErrors;
  }
}

