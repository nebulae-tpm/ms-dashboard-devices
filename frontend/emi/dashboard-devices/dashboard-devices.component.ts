import { transition } from "@angular/animations";
import { Observable } from "rxjs/Observable";
import { FuseTranslationLoaderService } from "./../../../core/services/translation-loader.service";
import { DashboardDevicesService } from "./dashboard-devices.service";
import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { fuseAnimations } from "../../../core/animations";
import {
  dataDevicesOnVsOff,
  multi,
  topDeviceList,
  writeErrosVsUsages,
  stressData
} from "./dummyData/data";
import { Subscription } from "rxjs/Subscription";
// tslint:disable-next-line:import-blacklist
import * as Rx from "rxjs";
import * as Util from "util";
import { map, first, mergeMap, toArray, pairwise, filter, groupBy, tap } from 'rxjs/operators';
import { range } from 'rxjs/observable/range';
import { locale as english } from "./i18n/en";
import { locale as spanish } from "./i18n/es";
import { DatePipe } from '@angular/common';
import { forkJoin } from "rxjs/observable/forkJoin";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { DataWidget7 } from "./dummyData/dummyData";

@Component({
  selector: "fuse-dashboard-devices",
  templateUrl: "./dashboard-devices.component.html",
  styleUrls: ["./dashboard-devices.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DashboardDevicesComponent implements OnInit, OnDestroy {
  projects: any[];
  selectedProject: any;
  totalDeviceAccout: Rx.Observable<number>;

  widget5: any = {};
  widget6: any = {};
  widget7: any = {};
  widget8: any = {};
  widget9: any = {};

  dataWidget7: DataWidget7[] = [];

  allSubscriptions: Subscription[] = [];

  constructor(
    private graphQlGatewayService: DashboardDevicesService,
    private translationLoader: FuseTranslationLoaderService,
    private datePipe: DatePipe
  ) {
    this.translationLoader.loadTranslations(english, spanish);

    this.widget5 = {
      data: dataDevicesOnVsOff,
      barPadding: 16,
      currentRange: "TW",
      xAxis: true,
      yAxis: true,
      gradient: false,
      legend: false,
      showXAxisLabel: false,
      xAxisLabel: "Cuenca",
      showYAxisLabel: true,
      yAxisLabel: "Número de dispositivos",
      scheme: {
        domain: ['#74C1E2', '#D3DBDF'] // D1E0E7
      },
      onSelect: ev => {}
    };

    this.widget6 = {
      name: "widget6",
      timeRanges: {
        ONE_HOUR: 1,
        TWO_HOURS: 2,
        THREE_HOURS: 3
      },
      currentTimeRange: 1,
      datasets: [
        {
          label: "Errores",
          data: [this.getRandomArray(12, 100, 300)],
          total: 0,
          fill: "start"
        },
        {
          label: "Usos",
          data: this.getRandomArray(12, 200, 2000),
          total: 0,
          fill: "start"
        }
      ],
      labels: ["12:00", "12:10", "12:20", "12:30", "12:40", "12:50", "13:00"],
      colors: [
        {
          borderColor: "#3949ab",
          backgroundColor: "rgba(57,73, 171,0.3)",
          pointBackgroundColor: "#3949ab",
          pointHoverBackgroundColor: "#3949ab",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        },
        {
          borderColor: "rgba(30, 136, 229, 0.87)",
          backgroundColor: "rgba(30, 136, 229, 0.3)",
          pointBackgroundColor: "rgba(30, 136, 229, 0.87)",
          pointHoverBackgroundColor: "rgba(30, 136, 229, 0.87)",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        }
      ],
      options: {
        spanGaps: false,
        legend: { display: false },
        maintainAspectRatio: false,
        tooltips: { position: "nearest", mode: "index", intersect: false },
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
              ticks: { fontColor: "rgba(0,0,0,0.54)" }
            }
          ],
          yAxes: [
            {
              gridLines: { tickMarkLength: 16 },
              ticks: {
                // stepSize: 200,
                beginAtZero: true
              },

            }
          ]
        },
        plugins: { filler: { propagate: false } }
      },
      chartType: "line",
      usagesCount: 0,
      errorsCount: 0,
      onSelect: ev => {
        console.log(ev);
      },
      onRangeChanged: (range: number) => {
        // console.log(range, " Selected");
        this.getDeviceTransactionByInterval(range, this.widget6.name, null);
      }
    };
    this.widget7 = {
      name: "widget7",
      rawData: [],
      datasets: [
        {
          label: "Usos",
          data: this.getRandomArray(12, 400, 4000),
          total: 0,
          fill: "start"
        },
        {
          label: "Errores",
          data: this.getRandomArray(12, 100, 400),
          total: 0,
          fill: "start"
        }
      ],
      labels: ["12:00", "12:10", "12:20", "12:30", "12:40", "12:50", "13:00"],
      cuencas: {},
      currentCuenca: 0,
      timeRanges: {
        ONE_HOUR: 1,
        TWO_HOURS: 2,
        THREE_HOURS: 3
      },
      currentTimeRange: 1,
      colors: [
        {
          borderColor: "#3949ab",
          backgroundColor: "rgba(57,73, 171,0.3)",
          pointBackgroundColor: "#3949ab",
          pointHoverBackgroundColor: "#3949ab",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        },
        {
          borderColor: "rgba(30, 136, 229, 0.87)",
          backgroundColor: "rgba(30, 136, 229, 0.3)",
          pointBackgroundColor: "rgba(30, 136, 229, 0.87)",
          pointHoverBackgroundColor: "rgba(30, 136, 229, 0.87)",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        }
      ],
      options: {
        spanGaps: false,
        legend: { display: false },
        maintainAspectRatio: false,
        tooltips: { position: "nearest", mode: "index", intersect: false },
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
              ticks: { fontColor: "rgba(0,0,0,0.54)" }
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
      chartType: "line",
      legend: true,
      explodeSlices: false,
      doughnut: true,
      gradient: false,
      scheme: {
        domain: ["#f44336", "#35c922", "#03a9f4", "#e91e63"]
      },
      onTimeRangeFilterChanged: (ev: number) => {
        console.log(ev, "Selected");
        console.log()
        this.getDeviceTransactionByInterval(ev, this.widget7.name, Object.keys(this.widget7.cuencas)[0]);

        // this.widget7.datasets.forEach(d => {
        //   d.total = this.getCountInArray(d.data);
        // });
      },
      onCuencaFilterChanged: ev => {
        console.log(ev, "Selected");
        const cuencaSelected = Object.keys(this.widget7.cuencas)[ev];
        this.getDeviceTransactionByInterval(ev + 1, this.widget7.name, cuencaSelected );
        // this.widget7.datasets.forEach(d => {
        //   d.total = this.getCountInArray(d.data);
        // });

      },
      onSelect: ev => {
        console.log(ev);
      }
    };

    this.widget8 = {
      view: [700, 400],
      timeRanges: [],
      data: [],
      currentTimeRange: 0,
      scheme: {
        domain: ["#f44336", "#35c922", "#03a9f4", "#e91e63", "#533599"]
      },
      onChangeTimeRange: index => {
        this.widget8.currentTimeRange = index;
        let newData =  this.widget8.timeRanges[this.widget8.currentTimeRange].data.slice();
        this.widget8.data = newData.sort((a,b) =>  b.value - a.value );
      },
      updateRowData : (data) => {
        this.widget8.timeRanges = JSON.parse(JSON.stringify(data));
        let dataUpdated = this.widget8.timeRanges[this.widget8.currentTimeRange].data;
        this.widget8.data = dataUpdated.sort((a, b) => b.value - a.value)
      }
    };

    this.widget9 = {
      timeRanges: [],
      currentTimeRange: 0,
      scheme: {
        domain: ["#f44336", "#35c922", "#03a9f4", "#e91e63", "#533599"]
      },
      units: "Usos totales",
      max: 100,
      min: 0,
      textValue: "",
      legend: true,
      toggleLegend: () => {
        console.log("toggleLegend...");
        this.widget9.legend = !this.widget9.legend;
      },
      onChangeTimeRange: index => {
        this.widget9.currentTimeRange = index;
        let data = this.widget9.timeRanges[this.widget9.currentTimeRange].data.slice();
        data = data.sort((a, b) => b.value - a.value);
        this.widget9.timeRanges[this.widget9.currentTimeRange].data = data;
        this.widget9.max = this.getMaxUsageMeter(data[0].value);
      },
      updateRowData: (result) => {
        this.widget9.timeRanges = JSON.parse(JSON.stringify(result));
        let data = this.widget9.timeRanges[this.widget9.currentTimeRange].data.slice();
        data = data.sort((a, b) => b.value - a.value);
        this.widget9.timeRanges[this.widget9.currentTimeRange].data = data;
        this.widget9.max = this.getMaxUsageMeter(data[0].value);
      }
    };
  }

  ngOnInit() {

    // Get all cuencas name with transactions
    this.getAllCuencasTransactionsOnInterval(1);


    // gets the total number of devices to show in alarms widgets
    this.totalDeviceAccout = this.graphQlGatewayService.getAllDevicesAccount();

    // fill the chart of transaction Vs write erros in all System
    this.getDeviceTransactionByInterval(1, this.widget6.name, null);

    //  online Vs offline devices subscription
    this.allSubscriptions.push(
      this.graphQlGatewayService.getDevicesOnlineVsOffline().subscribe(
        result => {
          this.widget5.data = result;
          // this.widget5.barPadding = Math.floor(Math.random() * 300 + 100);
        },
        error => console.log(error)
      )
    );

    /**
     * CPU_USAGE subcriptions
     */
    this.allSubscriptions.push(
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("CPU_USAGE")
        .map(response => response.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => {
            this.buildWidget("alertsByCpu", response);
          },
          error => console.log(error)
        ),
      this.graphQlGatewayService
        .listenDashboardDeviceCpuAlarmsEvents()
        .subscribe(
          resp => this.buildWidget("alertsByCpu", resp),
          err => console.log(err)
        )
    );

    /**
     * RAM MEMORY subcriptions
     */
    this.allSubscriptions.push(
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("RAM_MEMORY")
        .map(respond => respond.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => this.buildWidget("alertsByRamMemory", response),
          error => console.log(error)
        ),
      this.graphQlGatewayService
        .listenDashboardDeviceRamMemoryAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByRamMemory", response),
          error => console.log(error)
        )
    );

    /**
     * VOLTAGE subscriptions
     */
    this.allSubscriptions.push(
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("VOLTAGE")
        .map(response => response.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => this.buildWidget("alertsByVoltage", response),
          error => console.log(error)
        ),
      this.graphQlGatewayService
        .listenDashboardDeviceVoltageAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByVoltage", response),
          err => console.log(err)
        )
    );

    /**
     * TEMPERATURE subscriptions
     */
    this.allSubscriptions.push(
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("TEMPERATURE")
        .map(response => response.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => this.buildWidget("alertsByTemperature", response),
          error => console.log(error)
        ),
      this.graphQlGatewayService
        .listenDashboardDeviceTemperatureAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByTemperature", response),
          error => console.log(error)
        )
    );
    /**
     * subscription to update device on Vs device Off on bar Vertical bar
     */
    this.allSubscriptions.push(
      this.graphQlGatewayService
        .getDashboardDeviceNetworkStatusEvents()
        .subscribe(
          result => {
            this.widget5.data = result;
            // this.widget5.barPadding = (Math.floor(Math.random() * 300 + 100));
          },
          err => console.log(err)
        )
    );

    /**
     * subcription to receive the query respond about Influx of users
     * widget 8 y 9
     */
    this.getSucessTransactions();
    this.allSubscriptions.push(
      this.graphQlGatewayService.listenDeviceTransactionsUpdates().subscribe(
        () => {
          this.graphQlGatewayService
            .getSucessTransactionsGroupByGroupName()
            .subscribe(
              result =>  {
                this.getSucessTransactions();
                this.widget6.onRangeChanged(this.widget6.currentTimeRange);
              },
              error => console.log(error)
            );
        },
        error => console.log(error)
      )
    );
  }

  getDeviceTransactionByInterval(hours: number, widgetName: string, cuencaName: string) {
    //TODO: Change to currrent date
    console.log("====> hours", hours)
    let currentDate1 = new Date();
    currentDate1.setSeconds(0);
    currentDate1.setMilliseconds(0);

    const currentDate = Date.now();
    const endDate =
      currentDate1.getTime() +
      (10 -
        Number(
          this.datePipe.transform(new Date(currentDate1.getTime()), "mm")
        ) %
          10) *
        60000;
    const startDate = endDate - hours * 60 * 60 * 1000;

    console.log("Date range... ", startDate, endDate);

    this.getDeviceTransactionGroupByTimeInterval(startDate, endDate, hours, cuencaName)
    .subscribe(val => {
      const timeIntervals = val[0];
      const transactionsGroupByTimeIntervals: any =
        val[1].data.getDeviceTransactionsGroupByTimeInterval;

      for (let timeInterval of timeIntervals) {
        for (let transactionInterval of transactionsGroupByTimeIntervals) {
          // console.log(
          //   "transactionInterval.interval => " +
          //     transactionInterval.interval +
          //     " -- " +
          //     timeInterval.interval +
          //     " ******* " +
          //     (transactionInterval.interval == timeInterval.interval)
          // );
          if (transactionInterval.interval == timeInterval.interval) {
            timeInterval.transactions = transactionInterval.transactions;
            timeInterval.errors = transactionInterval.errors;
          }
        }
      }

      of(timeIntervals)
        .pipe(
          mergeMap(val =>
            forkJoin(
              from(val).pipe(
                map(val => {
                  return val.transactions;
                }),
                toArray()
              ),
              from(val).pipe(
                map(val => {
                  return val.errors;
                }),
                toArray()
              ),
              from(val).pipe(
                map(val => {
                  return this.datePipe.transform(
                    new Date(val.interval),
                    "hh:mm"
                  );
                }),
                toArray()
              )
            )
          ),
          map(
            ([successTransactions, failedTransactions, timeIntervalLabels]) => {
              return this.buildDeviceTransactionGroupByTimeIntervalWidget(
                successTransactions,
                failedTransactions,
                timeIntervalLabels
              );
            }
          )
        )
        .subscribe(val => {
          // console.log("Final interval => ", val);

          this[widgetName].labels.length = 0;
          for (let i = 0; i < val.labels.length; i++) {
            this[widgetName].labels.push(val.labels[i]);
          }

          this[widgetName].datasets = val.datasets;

          // console.log(this.widget6.datasets);
          this[widgetName].usagesCount = this.getCountInArray(this[widgetName].datasets[0].data);
          this[widgetName].errorsCount = this.getCountInArray(this[widgetName].datasets[1].data);
        });
    });
  }

  /**
   * Gets the devices transactions group by time interval of ten minutes
   * @param startDate
   * @param endDate
   */
  getDeviceTransactionGroupByTimeInterval(
    startDate: number,
    endDate: number,
    hours: number,
    cuencaName: string
  ) {
    return range(0, (hours * 6) + 1 ).pipe(
      map(val => {
        const value = {
          interval: startDate +  val * (10 * 60 * 1000),
          transactions: 0,
          errors: 0
        };
        // console.log("value ", value.interval, new Date(value.interval));
        return value;
      }),
      toArray(),
      mergeMap(timeMap => {
        // console.log("------------------> ", timeMap);
        return   forkJoin(
          of(timeMap),
          this.graphQlGatewayService
            .getDeviceTransactionsGroupByTimeInterval(startDate - (10 * 60 * 1000), endDate, cuencaName)
            .pipe(first())
        )
      }
      )
    );
  }

  buildDeviceTransactionGroupByTimeIntervalWidget(
    successTransactionList,
    failedTransactionList,
    timeIntervalList
  ) {
    return {
      datasets: [
        {
          label: "Usos",
          data: successTransactionList,
          fill: "start"
        },
        {
          label: "Errores",
          data: failedTransactionList,
          fill: "start"
        }
      ],
      labels: timeIntervalList
    };
  }

  getAllCuencasTransactionsOnInterval(hours){
    const now = Date.now();
    const subcriptionByIntervalAndGroupName = this.graphQlGatewayService
    .getDeviceTransactionsGroupByIntervalAndGroupName(now- (hours*60*60*1000), now)
    .subscribe(response => {
      let data = JSON.parse(JSON.stringify(response));
      data =  data.sort((a ,b) => {
            if (a < b){ return -1; }
            if (a > b){ return 1; }
            return 0;
          });
      this.widget7.cuencas= [];
      data.forEach((item, index) => { this.widget7.cuencas[item] = index; });
      console.log(this.widget7.cuencas);
      this.widget7.onTimeRangeFilterChanged(1);
      subcriptionByIntervalAndGroupName.unsubscribe();

    });

  }

  ngOnDestroy() {
    console.log("ngOnDestroy ...");
    this.allSubscriptions.forEach(s => s.unsubscribe());
  }

  onSelectChart(e) {
    console.log(e);
    console.log(dataDevicesOnVsOff);
  }

  getSucessTransactions() {
    const subscription = this.graphQlGatewayService
        .getSucessTransactionsGroupByGroupName()
        .subscribe(
          result => {
            this.widget8.updateRowData(result);
            this.widget9.updateRowData(result);
            subscription.unsubscribe();
          },
          error => console.log(error)
        )
  }

  getMaxUsageMeter(realMax: number): number {
    let resp = Math.floor(realMax + realMax / 20);
    if (resp % 2 !== 0) {
      resp = resp + 1;
    }
    while (resp % 10 !== 0) {
      resp = resp + 2;
    }
    while (resp % 100 !== 0) {
      resp = resp + 10;
    }
    while (resp % 1000 !== 0) {
      resp = resp + 100;
    }
    return resp;
  }

  getRandomArray(
    size: number,
    itemMinLimit: number,
    itemMaxLimit: number
  ): number[] {
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

  orderTimeRanges(array: any[]) {
    return array.sort((a, b) => a.order - b.order);
  }

  buildWidget(widgetName: string, widgetContent: any): void {
    const isNew = this[widgetName] ? false : true;
    let lastTimeRange = 0;
    if (!isNew) {
      lastTimeRange = this[widgetName].currentTimeRange;
      this[widgetName].timeRanges[this[widgetName].currentTimeRange].topDevices;
    }
    this[widgetName] = JSON.parse(JSON.stringify(widgetContent));
    this[widgetName].timeRanges = this.orderTimeRanges(
      this[widgetName].timeRanges
    );
    this[widgetName].currentTimeRange = lastTimeRange;
    this[widgetName].onChangeTimeRange = (ev: any) =>
      (this[widgetName].currentTimeRange = ev);
  }



}
