import { transition } from "@angular/animations";
import { FuseTranslationLoaderService } from "./../../../core/services/translation-loader.service";
import { DashboardDevicesService } from "./dashboard-devices.service";
import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { fuseAnimations } from "../../../core/animations";
import { Subscription } from "rxjs/Subscription";
// tslint:disable-next-line:import-blacklist
import * as Rx from "rxjs/Rx";
import { map, first, mergeMap, toArray, switchMap } from "rxjs/operators";
import { range } from "rxjs/observable/range";
import { locale as english } from "./i18n/en";
import { locale as spanish } from "./i18n/es";
import { DatePipe } from "@angular/common";
import { Router, NavigationExtras } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material";


@Component({
  selector: "fuse-dashboard-devices",
  templateUrl: "./dashboard-devices.component.html",
  styleUrls: ["./dashboard-devices.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DashboardDevicesComponent implements OnInit, OnDestroy {
  totalDeviceAccout: Rx.Observable<number>; // total number of devices to show in alarms widgets

  alertsByCpu: any = { isReady: false };
  alertsByRamMemory: any = { isReady: false };
  alertsByVoltage: any = { isReady: false };
  alertsByTemperature: any = { isReady: false };

  onlineVsOfflineByGroupNameWidget: any = {};
  successfulAndFailedTransactionWidget: any = {};
  successfulAndFailedTransactionByGroupNameWidget: any = {};
  influxOfUserAdvancedPieChart: any = {};
  influxOfUseGaugeChart: any = {};

  allSubscriptions: Subscription[] = [];

  constructor(
    private dashboardDeviceService: DashboardDevicesService,
    private translationLoader: FuseTranslationLoaderService,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private router: Router,
    public snackBar: MatSnackBar
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
      legend: true,
      toggleLegend: () => {
        // this.influxOfUseGaugeChart.legend = !this.influxOfUseGaugeChart.legend;
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
        this.influxOfUseGaugeChart.timeRanges = JSON.parse(
          JSON.stringify(result)
        );
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
    console.log("ngOnInit on Dashboard, Running Version 0.0.44");
    // Get all cuenca names with transactions in a interval time to set options in successfulAndFailedTransactionByGroupNameWidget
    this.getAllCuencaNamesWithSuccessTransactionsOnInterval(
      this.successfulAndFailedTransactionByGroupNameWidget.currentTimeRange
    );

    // gets the total number of devices to show in alarms widgets
    this.totalDeviceAccout = this.dashboardDeviceService.getAllDevicesAccount();

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
    nowDate.setMinutes(nowDate.getMinutes() - (nowDate.getMinutes() % 10));
    nowDate.setSeconds(0);
    nowDate.setMilliseconds(0);
    this.allSubscriptions.push(
      // Fill the data neccesary to display influxOfUserAdvancedPieChart and influxOfUseGaugeChart
      this.dashboardDeviceService
        .getSucessTransactionsGroupByGroupName(nowDate.getTime())
        .subscribe(
          result => {
            this.influxOfUserAdvancedPieChart.updateRowData(result);
            this.influxOfUseGaugeChart.updateRowData(result);
          },
          error => this.errorHandler(error)
        ),

      // online Vs offline GraphQl Query
      this.dashboardDeviceService.getDevicesOnlineVsOffline().subscribe(
        result => {
          const originalLength = result.length;
          while (result.length < 5) {
            result.push({
              name: " ".repeat(result.length + 1 - originalLength),
              series: [
                { name: "Online", value: 0 },
                { name: "Offline", value: 0 }
              ]
            });
          }
          this.onlineVsOfflineByGroupNameWidget.data = result;
          // this.widget5.barPadding = Math.floor(Math.random() * 300 + 100);
        },
        error => this.errorHandler(error)
      ),
      // online Vs offline GraphQl Subscription
      this.dashboardDeviceService
        .getDashboardDeviceNetworkStatusEvents()
        .subscribe(
          result => {
            console.log(" ## Updating online Vs offline devices chart");
            const originalLength = result.length;
            while (result.length < 5) {
              result.push({
                name: " ".repeat(result.length + 1 - originalLength),
                series: [
                  { name: "Online", value: 0 },
                  { name: "Offline", value: 0 }
                ]
              });
            }
            this.onlineVsOfflineByGroupNameWidget.data = result;
            // this.widget5.barPadding = (Math.floor(Math.random() * 300 + 100));
          },
          error => this.errorHandler(error)
        ),

      // CPU_USAGE GraphQl Query
      this.dashboardDeviceService
        .getDashboardDeviceAlertsBy("CPU_USAGE", Date.now())
        .pipe(mergeMap(resp => this.graphQlAlarmsErrorHandler$(resp)))
        .subscribe(
          response => {
            if (response !== null) {
              this.buildWidget("alertsByCpu", response);
            }
          },
          error => this.errorHandler(error)
        ),

      // CPU_USAGE GraphQl Subscription
      this.dashboardDeviceService
        .listenDashboardDeviceCpuAlarmsEvents()
        .subscribe(
          resp => this.buildWidget("alertsByCpu", resp),
          error => this.errorHandler(error)
        ),

      // RAM_MEMORY GraphQl Query
      this.dashboardDeviceService
        .getDashboardDeviceAlertsBy("RAM_MEMORY", Date.now())
        .pipe(mergeMap(resp => this.graphQlAlarmsErrorHandler$(resp)))
        .subscribe(
          response => {
            if (response !== null) {
              this.buildWidget("alertsByRamMemory", response);
            }
          },
          error => this.errorHandler(error)
        ),

      // RAM_MEMORY GraphQl Subscription
      this.dashboardDeviceService
        .listenDashboardDeviceRamMemoryAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByRamMemory", response),
          error => this.errorHandler(error)
        ),
      // VOLTAGE GraphQl Query
      this.dashboardDeviceService
        .getDashboardDeviceAlertsBy("VOLTAGE", Date.now())
        .pipe(mergeMap(resp => this.graphQlAlarmsErrorHandler$(resp)))
        .subscribe(
          response => this.buildWidget("alertsByVoltage", response),
          error => this.errorHandler(error)
        ),
      // VOLTAGE GraphQl Subscription
      this.dashboardDeviceService
        .listenDashboardDeviceVoltageAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByVoltage", response),
          error => this.errorHandler(error)
        ),
      // TEMPERATURE GraphQl Query
      this.dashboardDeviceService
        .getDashboardDeviceAlertsBy("TEMPERATURE", Date.now())
        .pipe(mergeMap(resp => this.graphQlAlarmsErrorHandler$(resp)))
        .subscribe(
          response => this.buildWidget("alertsByTemperature", response),
          error => this.errorHandler(error)
        ),
      // TEMPERATURE GraphQl Subscription
      this.dashboardDeviceService
        .listenDashboardDeviceTemperatureAlarmsEvents()
        .subscribe(
          response => this.buildWidget("alertsByTemperature", response),
          error => this.errorHandler(error)
        ),
      // GraphQl Subscription to let know about an update in transactions
      this.dashboardDeviceService
        .listenDeviceTransactionsUpdates()
        .pipe(
          switchMap(event => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - (now.getMinutes() % 10), 0, 0);
            return this.dashboardDeviceService.getSucessTransactionsGroupByGroupName(
              now.getTime()
            );
          })
        )
        .subscribe(
          data => {
            console.log("listenDeviceTransactionsUpdates()", data);
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
              this.successfulAndFailedTransactionByGroupNameWidget
                .currentTimeRange
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
        (Number(
          this.datePipe.transform(new Date(currentDate1.getTime()), "mm")
        ) %
          10)) *
        60000;
    const startDate = endDate - (hours * 60 * 60 * 1000 + 10 * 60 * 1000);
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

      Rx.Observable.of(timeIntervals)
        .pipe(
          mergeMap((val: any) =>
            Rx.Observable.forkJoin(
              Rx.Observable.from(val).pipe(
                map((val: any) => {
                  return val.transactions;
                }),
                toArray()
              ),
              Rx.Observable.from(val).pipe(
                map((val: any) => {
                  return val.errors;
                }),
                toArray()
              ),
              Rx.Observable.from(val).pipe(
                map((val: any) => {
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
          this[widgetName].labels.length = 0;
          for (let i = 0; i < val.labels.length; i++) {
            this[widgetName].labels.push(val.labels[i]);
          }

          this[widgetName].datasets = val.datasets;
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
        return value;
      }),
      toArray(),
      mergeMap(timeMap => {
        return Rx.Observable.forkJoin(
          Rx.Observable.of(timeMap),
          this.dashboardDeviceService
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
    const subcriptionByIntervalAndGroupName = this.dashboardDeviceService
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
        subcriptionByIntervalAndGroupName.unsubscribe();
      });
  }

  ngOnDestroy() {
    console.log("ngOnDestroy on Dashboard ...");
    this.allSubscriptions.forEach(s => s.unsubscribe());
  }

  getMaxUsageMeter(realMax: number): number {
    if (realMax < 1000) {
      return 1000;
    } else if (realMax < 2000) {
      return 2000;
    } else if (realMax < 4000) {
      return 4000;
    } else if (realMax < 6000) {
      return 6000;
    } else if (realMax < 8000) {
      return 8000;
    } else if (realMax < 10000) {
      return 10000;
    } else if (realMax < 12000) {
      return 12000;
    } else {
      // let resp = Math.floor(realMax + 30 / 100 * realMax);
      let resp = realMax;

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
    let lastTimeRange = 0;
    if (this[widgetName].isReady) {
      lastTimeRange = this[widgetName].currentTimeRange;
    }
    this[widgetName] = JSON.parse(JSON.stringify(widgetContent));

    this[widgetName].timeRanges = this[widgetName].timeRanges.sort(
      (a: any, b: any) => a.order - b.order
    );
    // limit each timerange to hace only 5 element to shpw but keeps all the devices in other prop
    this[widgetName].timeRanges.forEach(timeRange => {
      timeRange.fullDeviceTopList = timeRange.topDevices;
      timeRange.topDevices = timeRange.topDevices.slice(0, 5);
    });

    this[widgetName].currentTimeRange = lastTimeRange;
    this[widgetName].onChangeTimeRange = (ev: any) =>
      (this[widgetName].currentTimeRange = ev);

    this[widgetName].goToTopList = () => {
      const startTime =
        this[widgetName].queriedTime -
        (this[widgetName].currentTimeRange + 1) * 60 * 60 * 1000;
      const endTime = this[widgetName].queriedTime;
      this.allSubscriptions.push(
        Rx.Observable.forkJoin(
          this.translate.get("DASHBOARD.LABEL_FOR_DEVICES_FILTER"),
          this.translate.get(`DASHBOARD.ALARMS_TYPES.${this[widgetName].type}`)
          // this.translate.get('DASHBOARD.BETWEEN'),
          // Rx.Observable.of(new Date(startTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false })),
          // this.translate.get('DASHBOARD.AND'),
          // Rx.Observable.of(new Date(endTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }))
        )
          .map(([label, alarmType]) => {
            return label + " " + alarmType;
          })
          .subscribe(labelTranslation => {
            let navigationParams: NavigationExtras = {
              queryParams: {
                filterTemplate: JSON.stringify({
                  id: 1,
                  type: this[widgetName].type.slice(0, 4).replace("_", ""),
                  initTime: startTime,
                  endTime: endTime,
                  label: labelTranslation
                })
              }
            };
            console.log(["/devices"], navigationParams);
            this.router.navigate(["/devices"], navigationParams);
          })
      );
    };

    this[widgetName].isReady = true;
  }

  errorHandler(error: any): void {
    console.log("errorHandler", error);
  }

  onItemWithAlarmClick(
    deviceId: string,
    alarmType: string,
    timeRange: string,
    queriedTime: number
  ): void {
    let navigationParams: NavigationExtras = {
      queryParams: {
        filterTemplate: JSON.stringify({
          id: 2,
          type: alarmType.slice(0, 4).replace("_", ""),
          range: timeRange
          // queriedTime: queriedTime
        })
      }
    };
    console.log(["/devices/device", deviceId], navigationParams);
    this.router.navigate(["/devices/device", deviceId], navigationParams);
  }

  graphQlAlarmsErrorHandler$(response) {
    return Rx.Observable.of(JSON.parse(JSON.stringify(response))).pipe(
      map(resp => {
        if (resp.errors) {
          // TO-DO
          // show alerts in client propt
          console.log("ERRORS IN GRAPHQL ==> ", resp.errors);
          this.openSnackBar(resp.errors[0].message, 6000);
          return null;
        } else if (resp.data) {
          return resp.data["getDashBoardDevicesAlarmReport"];
        }
      })
    );
  }

  openSnackBar(error: any, duration: number, action?: string): void {
    this.translate
      .get("DASHBOARD.GRAPHQL_ERRORS." + error.code)
      .subscribe(translation => {
        this.snackBar.open(translation, action, {
          duration: duration
        });
      });
    // snackbarRef.onAction().subscribe((data) => {
    //   console.log("snackbarRef.onAction()", data);
    // })
  }
}
