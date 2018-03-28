import { DummyDevice, DummyTransactionPack } from './dummyData';
import { ChartJS } from './data';
import { ChartjsService } from './chartjs.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '../../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs';
import * as Util from 'util';
import { dataDevicesOnVsOff } from '../onOffByRoute/data';

import { from } from 'rxjs/observable/from';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';

@Component({
  selector: 'fuse-dashboard-chartjs',
  templateUrl: './chartjs.component.html',
  styleUrls: ['./chartjs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ChartjsComponent implements OnInit, OnDestroy {
  selectedProject: any;
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
  widget1: any = {};
  widget2: ChartJS;
  widget5: any = {};
  widget6: any = {};
  widget7: any = {};
  widget8: any = {};
  widget9: any = {};

  devices: DummyDevice[] = [];

  changesOnDevicesList$ = new Rx.Subject <any>();

  constructor(private chartJsService: ChartjsService) {
    // acá llega cada reporte del transacciones de cada dispositivo
    this.chartJsService.getTransactionUpdates().subscribe( (pkg: DummyTransactionPack) => {
      const index = this.devices.findIndex( d => d.SN === pkg.device.SN);
      if ( index === -1 ) {
        this.devices.push( pkg.device );
      }else {
        this.devices[index].lastConection = pkg.endTime;
      }
    });

    // time to update the view
    Rx.Observable.interval(2000).subscribe(t => {
      this.changesOnDevicesList$.next();
    });

    this.widget1 = {
      alerts: Math.floor(Math.random() * 200 + 90),
      reporterDevices: Math.floor(Math.random() * 50 + 30),
      label: 'Alertas por temperatura',
      listData: [],
      ranges: {
        h0_1: 'Última hora',
        h0_2: 'Últimas dos horas',
        h0_3: 'Últimas dos horas'
      },
      currentRange: 'h0_1',
      onSelectionChange: () => {
        console.log('widget1');
        this.widget1.alerts = Math.floor(Math.random() * 100 + 20);
        this.widget1.reporterDevices = Math.floor(Math.random() * 70);
      }
    };

    this.widget7 = {
      cuencas: {
        C1: 'Cuenca BMX',
        C2: 'Cuenca TREK',
        C3: 'Cuenca GMW',
        C4: 'Cuenca Polygon'
      },
      datasets: [
        {
          label: 'Errores',
          data: this.getRandomArray(12, 500, 900),
          fill: 'start'
        },
        {
          label: 'Usos',
          data: this.getRandomArray(12, 2000, 4000),
          fill: 'start'
        }
      ],
      labels: ['12:00', '12:10', '12:20', '12:30', '12:40', '12:50', '13:00'],
      currentCuenca: 'C1',
      timeRanges: {
        h0_1: 'Última hora',
        h0_2: 'Últimas dos horas',
        h0_3: 'Últimas dos horas'
      },
      currentTimeRange: 'h0_1',
      colors: [
        {
          borderColor: '#ce2b2b',
          backgroundColor: '#d15151',
          pointBackgroundColor: '#ce2b2b',
          pointHoverBackgroundColor: '#ce2b2b',
          pointBorderColor: '#ffffff',
          pointHoverBorderColor: '#ffffff'
        },
        {
          borderColor: '#30d11b',
          backgroundColor: '#8cff7c',
          pointBackgroundColor: '#30d11b',
          pointHoverBackgroundColor: '#30d11b',
          pointBorderColor: '#ffffff',
          pointHoverBorderColor: '#ffffff'
        }
      ],
      options: {
        spanGaps: true,
        legend: { display: true, position: 'bottom' },
        maintainAspectRatio: false,
        tooltips: { position: 'nearest', mode: 'index', intersect: false },
        layout: { padding: { left: 24, right: 32 } },
        elements: {
          point: {
            radius: 4,
            borderWidth: 2,
            hoverRadius: 4,
            hoverBorderWidth: 2
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: { display: false },
              ticks: { fontColor: 'rgba(0,0,0,0.54)' }
            }
          ],
          yAxes: [
            {
              gridLines: { tickMarkLength: 16 },
              ticks: { stepSize: 1000 }
            }
          ]
        },
        plugins: { filler: { propagate: false } }
      },
      chartType: 'line',
      onCuencaFilterChanged: ev => {
        console.log(ev, 'Selected');
        const length = this.widget7.datasets[0].data.length;
        this.widget7.datasets[0].data = this.getRandomArray(length, 500, 1500);
        this.widget7.datasets[1].data = this.getRandomArray(length, 1800, 4000);
      },
      onTimeRangeFilterChanged: ev => {
        console.log(ev, 'Selected');
        switch (ev) {
          case 'h0_1':
            this.widget7.labels = [
              '12:00',
              '12:10',
              '12:20',
              '12:30',
              '12:40',
              '12:50',
              '13:00'
            ];
            this.widget7.datasets[0].data = this.getRandomArray(7, 500, 1500);
            this.widget7.datasets[1].data = this.getRandomArray(7, 1800, 4000);
            break;
          case 'h0_3':
            this.widget7.labels = [
              '12:00',
              '12:30',
              '13:00',
              '13:30',
              '14:00',
              '14:30',
              '15:00'
            ];
            this.widget7.datasets[0].data = this.getRandomArray(7, 500, 1500);
            this.widget7.datasets[1].data = this.getRandomArray(7, 1800, 4000);
            break;
          case 'h0_24':
            this.widget7.labels = [
              '00:00',
              '2:00',
              '4:00',
              '6:00',
              '8:00',
              '10:00',
              '12:00',
              '14:00',
              '16:00',
              '18:00',
              '20:00',
              '22:00',
              '00:00'
            ];
            this.widget7.datasets[0].data = this.getRandomArray(13, 500, 1500);
            this.widget7.datasets[1].data = this.getRandomArray(13, 1800, 4000);
            break;
          case 'w0_1':
            this.widget7.labels = [
              'Lunes',
              'Martes',
              'Miercoles',
              'Jueves',
              'Viernes',
              'Sábado',
              'Domingo'
            ];
            this.widget7.datasets[0].data = this.getRandomArray(7, 500, 1500);
            this.widget7.datasets[1].data = this.getRandomArray(7, 1800, 4000);
            break;
        }
      }
    };

    this.widget2 = new ChartJS(
      [],
      this.widget7.datasets,
      this.widget7.labels,
      this.widget7.chartType,
      this.widget7.options,
      this.widget7.colors,
      false
    );

    this.widget6 = {
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: this.getRandomArray(7, 100, 500),
          fill: false
        },
        {
          label: 'My Second dataset',
          fill: false,
          backgroundColor: 'rgb(54, 162, 235)',
          borderColor: 'rgb(54, 162, 235)',
          data: this.getRandomArray(7, 600, 900)
        }
      ],
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'ChartJS Demo'
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Month'
              }
            }
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Value'
              }
            }
          ]
        }
      },
      chartType: 'line',
      onClick: () => {
        console.log('Agregando un dato');
        this.widget6.labels.push('OK :S');
        // this.widget6.datasets[0].data = this.widget6.datasets[0].data.slice().push( Math.random() * 600 + 900 );
        // this.widget6.datasets[1].data = this.widget6.datasets[1].data.slice().push( Math.random() * 600 + 500 );
      }
    };

    this.widget5 = {
      data: [],
      currentRange: 'TW',
      xAxis: true,
      yAxis: true,
      gradient: false,
      legend: false,
      showXAxisLabel: false,
      xAxisLabel: 'Days',
      showYAxisLabel: true,
      yAxisLabel: 'Número de dispositivos',
      scheme: {
        domain: ['#b71b00', '#42d824']
      },
      onSelect: ev => {
        console.log(ev);
      }
    };
  }

  ngOnInit() {
    console.log('OnInit...');

    this.changesOnDevicesList$.subscribe(() => {
      const devicesCopy = this.devices.slice();
      const source$ = from(devicesCopy);
      const groupsByCuenca$ = source$.pipe(
        groupBy (device => device.cuenca),
        mergeMap ( group =>  {
          const index = this.widget5.data.findIndex(cuenca => cuenca.name === group.key);
          if (index === -1){
            this.widget5.data.push({
              name: group.key,
              series: [{name: 'Offline', value: 0}, {name: 'Online', value: 0}]
            });
          }
          return group.pipe( toArray() );
        })
      );

      groupsByCuenca$.subscribe(deviceSByCuenca => {
        const now = Date.now();
        const frameTime = 1000 * 10; // 10 seconds | frame of time to decide if device is online or offline
        const cuencaIndex = this.widget5.data.findIndex(c => c.name === deviceSByCuenca[0].cuenca);
        deviceSByCuenca.forEach(d => d.online = d.lastConection > (now - frameTime));
        const onlineDevices = deviceSByCuenca.filter(device => device.online);
        this.widget5.data[cuencaIndex].series[0].value = deviceSByCuenca.length - onlineDevices.length;
        this.widget5.data[cuencaIndex].series[1].value = onlineDevices.length;
        this.widget5.data = this.widget5.data.slice();
      });

      const nowRef = Date.now();
      const nowLabel = new Date(nowRef);
      console.log(nowLabel.getDay() + '/' + nowLabel.getMonth() + '/' + nowLabel.getFullYear() );

    });
  }

  ngOnDestroy() {}

  print(args: any) {
    console.log(Util.inspect(args, { showHidden: false, depth: null }));
  }

  getRandomArray( size: number, itemMinLimit: number, itemMaxLimit: number ): number[] {
    let i = 0;
    const result = [];
    while (i < size) {
      result.push(Math.floor(Math.random() * itemMaxLimit + itemMinLimit));
      i++;
    }
    return result;
  }

  getCountInArray(array: number[]): number {
    let counter = 0;
    array.forEach(item => {
      counter = counter + item;
    });
    return counter;
  }

  simulateIncomingReport() {
    let labels = Object.create(this.widget7.labels);
    this.widget2.labels = labels;
    this.widget2.datasets[0].data = this.getRandomArray(7, 500, 1500);
    this.widget2.datasets[1].data = this.getRandomArray(7, 1800, 4000);
    labels = Object.create(this.widget6.labels);
    this.widget6.labels = labels;
    this.widget6.datasets[0].data.shift();
    this.widget6.datasets[1].data.shift();
    this.widget6.datasets[0].data.push(Math.random() * 500 + 1500);
    this.widget6.datasets[1].data.push(Math.random() * 1800 + 3000);
  }

  indexWhere (array: any[], condition) {
    const item = array.find(condition);
    return array.indexOf(item);
  }
}
