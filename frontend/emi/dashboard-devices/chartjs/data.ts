export class DeviceCommon {
  sn: string;
  hostname: string;
  cuenca: string;
  cpuCores: number;
  ram: number;

  constructor(
    sn: string,
    hostname: string,
    cuenca: string,
    cpuCores: number,
    ram: number
  ) {
    this.sn = sn;
    this.hostname = hostname;
    this.cuenca = cuenca;
    this.cpuCores = cpuCores;
    this.ram = ram;
  }
}
export class DeviceHardware {
  device: DeviceCommon;
  loadAvg1: string;
  loadAvg5: string;
  loadAvg15: string;
  loadAvg1Percentage: string;
  loadAvg5Percentage: string;
  loadAvg15Percentage: string;
  ramUsage: number;
  modenSignal: string;
  modenNetwork: string;
}
export class DeviceLocation {
  device: DeviceCommon;
  lat: number;
  lng: number;
  gpsQa: string;
}
export class DeviceTransaccion {
  device: DeviceCommon;
  timestampInit: number;
  timestampEnd: number;
  usages: number;
  errors: number;
}
export enum RamUsage {
  GOOD = 30,
  NORMAL = 50,
  BAD = 100
}

export class ChartJS {
  data: Array<number[]> | number[];
  datasets: Array<{ data: Array<number[]> | number[]; label: string }>;
  labels: Array<any>;
  chartType: string;
  options: any;
  colors: Array<any>;
  legend: boolean;

  constructor(
    data: Array<number[]> | number[],
    datasets: Array<{ data: Array<number[]> | number[]; label: string }>,
    labels: Array<any>,
    chartType: string,
    options: any,
    colors: Array<any>,
    legend: boolean
  ) {
    this.data = data;
    this.datasets = datasets;
    this.labels = labels;
    this.chartType = chartType;
    this.options = options;
    this.colors = colors;
    this.legend = legend;
  }
}
