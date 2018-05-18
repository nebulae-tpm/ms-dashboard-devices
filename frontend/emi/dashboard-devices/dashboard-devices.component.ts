import { transition } from "@angular/animations";
import { Observable } from "rxjs/Observable";
import { FuseTranslationLoaderService } from "./../../../core/services/translation-loader.service";
import { DashboardDevicesService } from "./dashboard-devices.service";
import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { fuseAnimations } from "../../../core/animations";
import { Subscription } from "rxjs/Subscription";
// tslint:disable-next-line:import-blacklist
import * as Rx from "rxjs";
import * as Util from "util";
import {
  map,
  first,
  mergeMap,
  toArray,
  pairwise,
  filter,
  throttleTime,
  groupBy,
  tap,
  switchMap
} from "rxjs/operators";
import { range } from "rxjs/observable/range";
import { locale as english } from "./i18n/en";
import { locale as spanish } from "./i18n/es";
import { DatePipe } from "@angular/common";
import { forkJoin } from "rxjs/observable/forkJoin";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";

@Component({
  selector: "fuse-dashboard-devices",
  templateUrl: "./dashboard-devices.component.html",
  styleUrls: ["./dashboard-devices.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DashboardDevicesComponent implements OnInit, OnDestroy {
  totalDeviceAccout: Rx.Observable<number>; // total number of devices to show in alarms widgets

  alertsByCpu: any = {};
  alertsByRamMemory: any = {};
  alertsByVoltage: any = {};
  alertsByTemperature: any = {};

  onlineVsOfflineByGroupNameWidget: any = {};
  successfulAndFailedTransactionWidget: any = {};
  successfulAndFailedTransactionByGroupNameWidget: any = {};
  influxOfUserAdvancedPieChart: any = {};
  influxOfUseGaugeChart: any = {};

  allSubscriptions: Subscription[] = [];

  constructor(
    private graphQlGatewayService: DashboardDevicesService,
    private translationLoader: FuseTranslationLoaderService,
    private datePipe: DatePipe
  ) {
    this.translationLoader.loadTranslations(english, spanish);

    this.onlineVsOfflineByGroupNameWidget = {
      data: [],
      barPadding: 16,
      xAxis: true,
      yAxis: true,
      gradient: false,
      legend: false,
      showXAxisLabel: false,
      xAxisLabel: "Cuenca",
      showYAxisLabel: true,
      yAxisLabel: "DASHBOARD.NUMBER_OF_DEVICES",
      scheme: {
        domain: ["#74C1E2", "#D3DBDF"]
      },
      onSelect: ev => {}
    };
    this.successfulAndFailedTransactionWidget = {
      name: "successfulAndFailedTransactionWidget",
      timeRanges: {
        ONE_HOUR: 1,
        TWO_HOURS: 2,
        THREE_HOURS: 3
      },
      currentTimeRange: 1,
      datasets: [
        {
          label: "Errores",
          data: [],
          total: 0,
          fill: "start"
        },
        {
          label: "Usos",
          data: [],
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
              }
            }
          ]
        },
        plugins: { filler: { propagate: false } }
      },
      chartType: "line",
      usagesCount: 0,
      errorsCount: 0,
      onRangeChanged: (range: number) => {
        this.getDeviceTransactionByInterval(
          range,
          this.successfulAndFailedTransactionWidget.name,
          null
        );
      }
    };
    this.successfulAndFailedTransactionByGroupNameWidget = {
      name: "successfulAndFailedTransactionByGroupNameWidget",
      rawData: [],
      datasets: [
        {
          label: "Usos",
          data: [],
          total: 0,
          fill: "start"
        },
        {
          label: "Errores",
          data: [],
          total: 0,
          fill: "start"
        }
      ],
      labels: ["12:00", "12:10", "12:20", "12:30", "12:40", "12:50", "13:00"],
      cuencas: {},
      // cuencasAsync: new Rx.Subject<any[]>(),
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
              ticks: {
                // stepSize: 200,
                beginAtZero: true
              }
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
      onTimeRangeFilterChanged: (
        ev: number,
        updateCuencaOptions: boolean = false
      ) => {
        console.log(
          "onTimeRangeFilterChanged",
          ev,
          updateCuencaOptions,
          this.successfulAndFailedTransactionByGroupNameWidget.currentTimeRange
        );
        const cuencaNumberSelected = this
          .successfulAndFailedTransactionByGroupNameWidget.currentCuenca;
        const cuencaNameSelected = Object.keys(
          this.successfulAndFailedTransactionByGroupNameWidget.cuencas
        )[cuencaNumberSelected];
        if (updateCuencaOptions) {
          this.getAllCuencaNamesWithSuccessTransactionsOnInterval(ev);
        }
        this.getDeviceTransactionByInterval(
          ev,
          this.successfulAndFailedTransactionByGroupNameWidget.name,
          cuencaNameSelected
        );
      },
      onCuencaFilterChanged: ev => {
        const cuencaSelected = Object.keys(
          this.successfulAndFailedTransactionByGroupNameWidget.cuencas
        )[ev];

        this.getDeviceTransactionByInterval(
          this.successfulAndFailedTransactionByGroupNameWidget.currentTimeRange,
          this.successfulAndFailedTransactionByGroupNameWidget.name,
          cuencaSelected
        );
      }
    };
    this.influxOfUserAdvancedPieChart = {
      view: [700, 400],
      timeRanges: [],
      data: [],
      currentTimeRange: 0,
      scheme: {
        domain: ["#f44336", "#35c922", "#03a9f4", "#533599", "#cca300"]
      },
      onChangeTimeRange: index => {
        this.influxOfUserAdvancedPieChart.currentTimeRange = index;
        let newData = this.influxOfUserAdvancedPieChart.timeRanges[
          this.influxOfUserAdvancedPieChart.currentTimeRange
        ].data.slice();
        this.influxOfUserAdvancedPieChart.data = newData.sort(
          (a, b) => b.value - a.value
        );
      },
      updateRowData: data => {
        this.influxOfUserAdvancedPieChart.timeRanges = JSON.parse(
          JSON.stringify(data)
        );
        let dataUpdated = this.influxOfUserAdvancedPieChart.timeRanges[
          this.influxOfUserAdvancedPieChart.currentTimeRange
        ].data;
        this.influxOfUserAdvancedPieChart.data = dataUpdated.sort(
          (a, b) => b.value - a.value
        );
      }
    };
    // timeRanges[influxOfUseGaugeChart.currentTimeRange].data
    this.influxOfUseGaugeChart = {
      isReady: false,
      data: [],
      timeRanges: [],
      currentTimeRange: 0,
      scheme: {
        domain: ["#f44336", "#35c922", "#03a9f4", "#533599", "#cca300"]
        // domain: ["#3399ff", "#9999ff", "#33ff77", "#ff6666", "#cc00cc"]
      },
      units: "Usos totales",
      max: 100,
      min: 0,
      textValue: "",
      legend: false,
      toggleLegend: () => {
        this.influxOfUseGaugeChart.legend = !this.influxOfUseGaugeChart.legend;
      },
      onChangeTimeRange: index => {
        this.influxOfUseGaugeChart.currentTimeRange = index;
        let data = this.influxOfUseGaugeChart.timeRanges[
          this.influxOfUseGaugeChart.currentTimeRange
        ].data.slice();
        data = data.sort((a, b) => b.value - a.value);
        this.influxOfUseGaugeChart.data = data;
        if (data[0]) {
          this.influxOfUseGaugeChart.max = this.getMaxUsageMeter(data[0].value);
        }
      },
      updateRowData: result => {
        this.influxOfUseGaugeChart.timeRanges = JSON.parse(JSON.stringify(result));
        let data = this.influxOfUseGaugeChart.timeRanges[
          this.influxOfUseGaugeChart.currentTimeRange
        ].data.slice();
        data = data.sort((a, b) => b.value - a.value);
        this.influxOfUseGaugeChart.data = data;
        this.influxOfUseGaugeChart.isReady = true;
        if (data[0]) {
          this.influxOfUseGaugeChart.max = this.getMaxUsageMeter(data[0].value);
        }
      }
    };
  }

  ngOnInit() {
    console.log("Running Version 0.0.24");
    // Get all cuenca names with transactions in a interval time to set options in successfulAndFailedTransactionByGroupNameWidget
    this.getAllCuencaNamesWithSuccessTransactionsOnInterval(
      this.successfulAndFailedTransactionByGroupNameWidget.currentTimeRange
    );

    // gets the total number of devices to show in alarms widgets
    this.totalDeviceAccout = this.graphQlGatewayService.getAllDevicesAccount();

    // fill the chart of transaction Vs write erros in all System
    this.getDeviceTransactionByInterval(
      1,
      this.successfulAndFailedTransactionWidget.name,
      null
    );

    //
    this.successfulAndFailedTransactionByGroupNameWidget.onTimeRangeFilterChanged(
      1,
      true
    );

    // All RxJs Subscriptions with querie and subscriptions of grahpQl

    const nowDate = new Date();
    nowDate.setMinutes(nowDate.getMinutes() - nowDate.getMinutes() % 10);
    nowDate.setSeconds(0);
    nowDate.setMilliseconds(0);
    this.allSubscriptions.push(
      // Fill the data neccesary to display influxOfUserAdvancedPieChart and influxOfUseGaugeChart
      this.graphQlGatewayService
        .getSucessTransactionsGroupByGroupName(nowDate.getTime())
        .subscribe(
          result => {
            console.log(".getSucessTransactionsGroupByGroupName()", result);
            this.influxOfUserAdvancedPieChart.updateRowData(result);
            this.influxOfUseGaugeChart.updateRowData(result);
          },
          error => this.errorHandler(error)
        ),

      // online Vs offline GraphQl Query
      this.graphQlGatewayService.getDevicesOnlineVsOffline().subscribe(
        result => {
          this.onlineVsOfflineByGroupNameWidget.data = result;
          // this.widget5.barPadding = Math.floor(Math.random() * 300 + 100);
        },
        error => this.errorHandler(error)
      ),
      // online Vs offline GraphQl Subscription
      this.graphQlGatewayService
        .getDashboardDeviceNetworkStatusEvents()
        .subscribe(
          result => {
            this.onlineVsOfflineByGroupNameWidget.data = result;
            // this.widget5.barPadding = (Math.floor(Math.random() * 300 + 100));
          },
          error => this.errorHandler(error)
        ),

      // CPU_USAGE GraphQl Query
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("CPU_USAGE")
        .map(response => response.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => {
            this.buildWidget("alertsByCpu", response);
          },
          error => this.errorHandler(error)
        ),

      // CPU_USAGE GraphQl Subscription
      this.graphQlGatewayService
        .listenDashboardDeviceCpuAlarmsEvents()
        .subscribe(
          resp => this.buildWidget("alertsByCpu", resp),
          error => this.errorHandler(error)
        ),

      // RAM_MEMORY GraphQl Query
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("RAM_MEMORY")
        .map(respond => respond.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => this.buildWidget("alertsByRamMemory", response),
          error => this.errorHandler(error)
        ),

      // RAM_MEMORY GraphQl Subscription
      this.graphQlGatewayService
        .listenDashboardDeviceRamMemoryAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByRamMemory", response),
          error => this.errorHandler(error)
        ),
      // VOLTAGE GraphQl Query
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("VOLTAGE")
        .map(response => response.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => this.buildWidget("alertsByVoltage", response),
          error => this.errorHandler(error)
        ),
      // VOLTAGE GraphQl Subscription
      this.graphQlGatewayService
        .listenDashboardDeviceVoltageAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByVoltage", response),
          error => this.errorHandler(error)
        ),
      // TEMPERATURE GraphQl Query
      this.graphQlGatewayService
        .getDashboardDeviceAlertsBy("TEMPERATURE")
        .map(response => response.data.getDashBoardDevicesAlarmReport)
        .subscribe(
          response => this.buildWidget("alertsByTemperature", response),
          error => this.errorHandler(error)
        ),
      // TEMPERATURE GraphQl Subscription
      this.graphQlGatewayService
        .listenDashboardDeviceTemperatureAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByTemperature", response),
          error => this.errorHandler(error)
        ),
      // GraphQl Subscription to let know about an update in transactions
      this.graphQlGatewayService
        .listenDeviceTransactionsUpdates()
        .pipe(
          switchMap(event => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getMinutes() % 10);
            now.setSeconds(0);
            now.setMilliseconds(0);
            return this.graphQlGatewayService.getSucessTransactionsGroupByGroupName(
              now.getTime()
            );
          })
        )
        .subscribe(
          data => {
            // console.log(".listenDeviceTransactionsUpdates()", data);
            // To update and display the influxOfUseGaugeChart and influxOfUserAdvancedPieChart data
            this.influxOfUserAdvancedPieChart.updateRowData(data);
            this.influxOfUseGaugeChart.updateRowData(data);

            // To update and display the successfulAndFailedTransactionWidget data.
            this.successfulAndFailedTransactionWidget.onRangeChanged(
              this.successfulAndFailedTransactionWidget.currentTimeRange
            );

            // To update and display the successfulAndFailedTransactionByGroupNameWidget data
            // const cuencaSelected = this.successfulAndFailedTransactionByGroupNameWidget.currentCuenca;
            this.successfulAndFailedTransactionByGroupNameWidget.onTimeRangeFilterChanged(
              this.successfulAndFailedTransactionByGroupNameWidget.currentTimeRange
            );
            // this.successfulAndFailedTransactionByGroupNameWidget.onCuencaFilterChanged(cuencaSelected);
          },
          error => this.errorHandler(error)
        )
    );
  }

  getDeviceTransactionByInterval(
    hours: number,
    widgetName: string,
    cuencaName: string
  ) {
    //TODO: Change to currrent date
    let currentDate1 = new Date();
    currentDate1.setSeconds(0, 0);

    const currentDate = Date.now();
    const endDate =
      currentDate1.getTime() +
      (10 -
        Number(
          this.datePipe.transform(new Date(currentDate1.getTime()), "mm")
        ) %
          10) *
        60000;
    const startDate = endDate - ((hours * 60 * 60 * 1000) + 10 * 60 * 1000 ) ;

    // console.log("Date range... ", startDate, endDate);

    this.getDeviceTransactionGroupByTimeInterval(
      startDate,
      endDate,
      hours,
      cuencaName
    ).subscribe(val => {
      const timeIntervals = val[0];
      const transactionsGroupByTimeIntervals: any =
        val[1].data.getDeviceTransactionsGroupByTimeInterval;

      for (let timeInterval of timeIntervals) {
        for (let transactionInterval of transactionsGroupByTimeIntervals) {
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
                  return new Date(val.interval).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: false
                  });
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
          this[widgetName].usagesCount = this.getCountInArray(
            this[widgetName].datasets[0].data
          );
          this[widgetName].errorsCount = this.getCountInArray(
            this[widgetName].datasets[1].data
          );
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
    return range(0, hours * 6 + 1).pipe(
      map(val => {
        const value = {
          interval: startDate + val * (10 * 60 * 1000),
          transactions: 0,
          errors: 0
        };
        // console.log("value ", value.interval, new Date(value.interval));
        return value;
      }),
      toArray(),
      mergeMap(timeMap => {
        // console.log("------------------> ", timeMap);
        return forkJoin(
          of(timeMap),
          this.graphQlGatewayService
            .getDeviceTransactionsGroupByTimeInterval(
              startDate - 10 * 60 * 1000,
              endDate,
              cuencaName
            )
            .pipe(first())
        );
      })
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

  getAllCuencaNamesWithSuccessTransactionsOnInterval(hours) {
    const now = Date.now();
    const subcriptionByIntervalAndGroupName = this.graphQlGatewayService
      .getCuencaNamesWithSuccessTransactionsOnInterval(
        now - hours * 60 * 60 * 1000,
        now
      )
      .subscribe(response => {
        let data = JSON.parse(JSON.stringify(response));
        data = data.sort((a, b) => {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        this.successfulAndFailedTransactionByGroupNameWidget.cuencas = {};
        if (data && data.length > 0) {
          data.forEach((item, index) => {
            this.successfulAndFailedTransactionByGroupNameWidget.cuencas[
              item
            ] = index;
          });
        }
        console.log(
          this.successfulAndFailedTransactionByGroupNameWidget.cuencas
        );
        // this.successfulAndFailedTransactionByGroupNameWidget.onTimeRangeFilterChanged(
        //   1
        // );
        subcriptionByIntervalAndGroupName.unsubscribe();
      });
  }

  ngOnDestroy() {
    console.log("ngOnDestroy ...");
    this.allSubscriptions.forEach(s => s.unsubscribe());
  }

  onSelectChart(e) {
    console.log(e);
  }

  getMaxUsageMeter(realMax: number): number {
    if( realMax > (Math.floor( (96/100) * this.influxOfUseGaugeChart.max) ) ){
      let resp = Math.floor(realMax + (30/100) * realMax);
      // let resp = realMax;

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
    return this.influxOfUseGaugeChart.max;
  }

  /**
   * gives the total summation of all item in the Array
   * @param array Array with items to get the summary
   */
  getCountInArray(array: number[]): number {
    let counter = 0;
    if (!array || array.length == 0) {
      return 0;
    }
    array.forEach(item => {
      counter = counter + item;
    });
    return counter;
  }

  buildWidget(widgetName: string, widgetContent: any): void {
    const isNew = this[widgetName].currentTimeRange ? false : true;
    let lastTimeRange = 0;
    if (!isNew) {
      lastTimeRange = this[widgetName].currentTimeRange;
      this[widgetName].timeRanges[this[widgetName].currentTimeRange].topDevices;
    }
    this[widgetName] = JSON.parse(JSON.stringify(widgetContent));
    this[widgetName].timeRanges = this[widgetName].timeRanges.sort(
      (a: any, b: any) => a.order - b.order
    );
    this[widgetName].currentTimeRange = lastTimeRange;
    this[widgetName].onChangeTimeRange = (ev: any) =>
      (this[widgetName].currentTimeRange = ev);

    this[widgetName].isReady = true;
  }

  errorHandler(error: any): void {
    console.log(error);
  }
}
