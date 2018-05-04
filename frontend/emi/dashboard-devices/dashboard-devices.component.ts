import { transition } from '@angular/animations';
import { Observable } from "rxjs/Observable";
import { FuseTranslationLoaderService } from "./../../../core/services/translation-loader.service";
import { DashboardDevicesService } from "./dashboard-devices.service";
import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { fuseAnimations } from "../../../core/animations";
import {
  data,
  dataDevicesOnVsOff,
  multi,
  topDeviceList,
  writeErrosVsUsages,
  stressData
} from "./dummyData/data";
import { Subscription } from "rxjs/Subscription";
// tslint:disable-next-line:import-blacklist
import * as Rx from "rxjs";
import { locale as english } from "./i18n/en";
import { locale as spanish } from "./i18n/es";
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

  widget5: any = {};
  widget6: any = {};
  widget7: any = {};
  widget8: any = {};
  widget9: any = {};
  widget10: any = {};
  widget11: any = {};

  dataWidget7: DataWidget7[] = [];




  allSubscriptions: Subscription[] = [];

  constructor(
    private graphQlGatewayService: DashboardDevicesService,
    private translationLoader: FuseTranslationLoaderService
  ) {
    this.translationLoader.loadTranslations(english, spanish);

    this.widget5 = {
      data: dataDevicesOnVsOff,
      barPadding : 16,
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
        domain: ["#a84a4a", "#c0ffa8"]
      },
      onSelect: ev => {
        console.log(ev);
      }
    };

    this.widget6 = {
      timeRanges: {
        h0_1: "Última hora",
        h0_2: "Últimas dos horas",
        h0_3: "Últimas tres horas"
      },
      currentTimeRange: "h0_1",
      datasets: [
        {
          label: "Errores",
          data: this.getRandomArray(12, 100, 300),
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
          backgroundColor: "#3949ab",
          pointBackgroundColor: "#3949ab",
          pointHoverBackgroundColor: "#3949ab",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        },
        {
          borderColor: "rgba(30, 136, 229, 0.87)",
          backgroundColor: "rgba(30, 136, 229, 0.87)",
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
      usagesCount: new Rx.Subject(),
      errorsCount: new Rx.Subject(),
      onSelect: ev => {
        console.log(ev);
      },
      onRangeChanged: (range: any) => {
        console.log(range, " Selected");
        switch (range) {
          case "h0_1":
            this.widget6.labels = [
              "12:00",
              "12:10",
              "12:20",
              "12:30",
              "12:40",
              "12:50",
              "13:00"
            ];
            this.widget6.datasets[0].data = this.getRandomArray(7, 500, 1500);
            this.widget6.datasets[1].data = this.getRandomArray(7, 1800, 4000);
            break;
          case "h0_2":
            this.widget6.labels = [
              "12:00",
              "12:20",
              "12:40",
              "13:00",
              "13:20",
              "13:40",
              "14:00"
            ];
            this.widget6.datasets[0].data = this.getRandomArray(13, 500, 1500);
            this.widget6.datasets[1].data = this.getRandomArray(13, 1800, 4000);
            break;
          case "h0_3":
            this.widget6.labels = [
              "12:00",
              "12:30",
              "13:00",
              "13:30",
              "14:00",
              "14:30",
              "15:00"
            ];
            this.widget6.datasets[0].data = this.getRandomArray(7, 500, 1500);
            this.widget6.datasets[1].data = this.getRandomArray(7, 1800, 4000);
            break;
        }
        this.widget6.usagesCount.next(
          this.getCountInArray(this.widget6.datasets[1].data)
        );
        this.widget6.errorsCount.next(
          this.getCountInArray(this.widget6.datasets[0].data)
        );
      }
    };
    this.widget7 = {
      rawData: [],
      datasets: [
        {
          label: "Errores",
          data: this.getRandomArray(12, 100, 400),
          total: 0,
          fill: "start"
        },
        {
          label: "Usos",
          data: this.getRandomArray(12, 400, 4000),
          total: 0,
          fill: "start"
        }
      ],
      labels: ["12:00", "12:10", "12:20", "12:30", "12:40", "12:50", "13:00"],
      cuencas: [],
      currentCuenca: 0,
      timeRanges: [],
      currentTimeRange: 0,
      colors: [
        {
          borderColor: "#3949ab",
          backgroundColor: "#3949ab",
          pointBackgroundColor: "#3949ab",
          pointHoverBackgroundColor: "#3949ab",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        },
        {
          borderColor: "rgba(30, 136, 229, 0.87)",
          backgroundColor: "rgba(30, 136, 229, 0.87)",
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
      onCuencaFilterChanged: ev => {
        console.log(ev, "Selected");
        this.widget7.currentCuenca = ev;
        const length = this.widget7.datasets[0].data.length;
        this.widget7.datasets[0].data = this.getRandomArray(length, 300, 400);
        this.widget7.datasets[1].data = this.getRandomArray(length, 600, 1000);
        this.widget7.datasets = this.widget7.datasets.slice();

        this.widget7.datasets.forEach(d => {
          d.total = this.getCountInArray(d.data);
        });
        this.widget7.fillTimeRanges();

      },
      onTimeRangeFilterChanged: ev => {
        console.log(ev, "Selected");
        switch (ev) {
          case "h0_1":
            this.widget7.labels = [
              "12:00",
              "12:10",
              "12:20",
              "12:30",
              "12:40",
              "12:50",
              "13:00"
            ];
            this.widget7.datasets[0].data = this.getRandomArray(7, 300, 400);
            this.widget7.datasets[1].data = this.getRandomArray(7, 600, 1000);
            break;
          case "h0_2":
            this.widget7.labels = [
              "12:00",
              "12:20",
              "12:40",
              "13:00",
              "13:20",
              "13:40",
              "14:00"
            ];
            this.widget7.datasets[0].data = this.getRandomArray(7, 300, 400);
            this.widget7.datasets[1].data = this.getRandomArray(7, 600, 1000);
            break;
          case "h0_3":
            this.widget7.labels = [
              "12:00",
              "12:30",
              "13:00",
              "13:30",
              "14:00",
              "14:30",
              "15:00"
            ];
            this.widget7.datasets[0].data = this.getRandomArray(7, 300, 400);
            this.widget7.datasets[1].data = this.getRandomArray(7, 600, 1000);
            break;
        }

        this.widget7.datasets.forEach(d => {
          d.total = this.getCountInArray(d.data);
        });
      },
      onSelect: ev => {
        console.log(ev);
      },
      fillTimeRanges: () => {
        console.log("fillingTimeRanges...");
        console.log("this.widget7.rawData", this.widget7.rawData);
        this.widget7.rawData.forEach(cuencaData => {
          console.log("cuencaData", cuencaData)
        })
      }
    };

    this.widget8 = {
      view: [700, 400],
      rawData: [],
      ranges: {
        h0_1: "Última hora",
        h0_2: "Últimas dos horas",
        h0_3: "Últimas tres horas"
      },
      currentRange: "h0_1",
      scolorScheme: {
        domain: ["#5AA454", "#A10A28", "#C7B42C", "#AAAAAA"]
      },
      data: [
        {
          name: "Cuenca 5",
          value: 1000
        },
        {
          name: "Cuenca 4",
          value: 2695
        },
        {
          name: "Cuenca 3",
          value: 3598
        },
        {
          name: "Cuenca 2",
          value: 745
        },
        {
          name: "Cuenca 1",
          value: 2569
        }
      ],
      onSelect: ev => {
        console.log(ev);
      },
      onChangeTimeRange: (timeRange) => {

      }
    };
    this.widget9 = {
      data: [
        {
          name: "Cuenca 5",
          color: "#f44336",
          value: 45
        },
        {
          name: "Cuenca 4",
          color: "#35c922",
          value: 45
        },
        {
          name: "Cuenca 3",
          color: "#03a9f4",
          value: 34
        },
        {
          name: "Cuenca 2",
          color: "#03a9f4",
          value: 67
        },
        {
          name: "Cuenca 1",
          color: "#533599",
          value: 89
        }
      ],
      ranges: {
        h0_1: "Última hora",
        h0_2: "Últimas dos horas",
        h0_3: "Últimas tres horas"
      },
      currentRange: "h0_1",
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
      }
    };
    this.widget10 = {
      datasets: [
        {
          label: "Cuenca 1",
          data: [410, 380, 320, 290, 190, 390, 250, 380, 300, 340, 220, 290],
          fill: "start"
        },
        {
          label: "Cuenca 2",
          data: [
            3000,
            3400,
            4100,
            3800,
            2200,
            3200,
            2900,
            1900,
            2900,
            3900,
            2500,
            3800
          ],
          fill: "start"
        }
      ],
      labels: [
        "12am",
        "2am",
        "4am",
        "6am",
        "8am",
        "10am",
        "12pm",
        "2pm",
        "4pm",
        "6pm",
        "8pm",
        "10pm"
      ],
      colors: [
        {
          borderColor: "#3949ab",
          backgroundColor: "#3949ab",
          pointBackgroundColor: "#3949ab",
          pointHoverBackgroundColor: "#3949ab",
          pointBorderColor: "#ffffff",
          pointHoverBorderColor: "#ffffff"
        },
        {
          borderColor: "rgba(30, 136, 229, 0.87)",
          backgroundColor: "rgba(30, 136, 229, 0.87)",
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
      chartType: "line"
    };
    this.widget11 = {
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "# of Votes",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderColor: [
              "rgba(255,99,132,1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      },
      type: "bar"
    };
  }

  ngOnInit() {

      Rx.Observable.from(this.getRandomWidget7Data())
      .groupBy(item => item.groupName)
      .mergeMap(group => group.toArray())
      .map(data => {
        return {
          cuenca: data[0].groupName,
          data: data
        }
      })
      .toArray()
      .subscribe(r => {
        const now = Date.now();
        const lastHour = now - 60*60*1000;
        const lastTwoHours = lastHour - 60*60*1000;
        const lastThreeHours = lastTwoHours - 60*60*1000;
        console.log(r);

        r.forEach(item => {
          this.widget8.rawData.push({
            cuenca: item.cuenca,
            ONE_HOUR: 0,
            TWO_HOURS: 0,
            THREE_HOURS: 0
          })
        });

        console.log(this.widget8.rawData);

        r.forEach(row => {
          row.data.forEach(item => {
            if (item.interval > lastHour ) {
              const index = this.widget8.rawData.findIndex(i => i.cuenca === item.groupName);
              this.widget8.rawData[index]["ONE_HOUR"] =  this.widget8.rawData[index]["ONE_HOUR"] + item.transactions;
              return;
            }
            if (item.interval > lastTwoHours && item.interval < lastHour ) {
              const index = this.widget8.rawData.findIndex(i => i.cuenca === item.groupName);
              this.widget8.rawData[index]["TWO_HOURS"] = this.widget8.rawData[index]["TWO_HOURS"] + item.transactions;
              return;
            }
            if (item.interval > lastThreeHours && item.interval < lastTwoHours ) {
              const index = this.widget8.rawData.findIndex(i => i.cuenca === item.groupName);
              this.widget8.rawData[index]["THREE_HOURS"] = this.widget8.rawData[index]["THREE_HOURS"] + item.transactions;
              return;
            }
          });
        });

        console.log(this.widget8.rawData);




      })

    console.log("On constructor...");
    //  online Vs offline devices subscription
    this.allSubscriptions.push(
      this.graphQlGatewayService
        .getDevicesOnlineVsOffline()
        .subscribe(
          (result) => {
            this.widget5.data = result;
            // this.widget5.barPadding = Math.floor(Math.random() * 300 + 100);

          },
          (error) => console.log(error)
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
          (result) => {
          this.widget5.data = result;
          // this.widget5.barPadding = (Math.floor(Math.random() * 300 + 100));
          },
          (err) => console.log(err)
        )
      );
    this.allSubscriptions.push(
      this.graphQlGatewayService.getSucessTransactionsGroupByGroupName()
      .subscribe(result => {
        console.log("====>", JSON.stringify(result));
      })
    );





    Rx.Observable.interval(3000).subscribe(t => {
      this.widget7.datasets[1].data = this.getRandomArray(7, 1800, 4000);
      this.widget6.usagesCount.next(
        this.getCountInArray(this.widget6.datasets[1].data)
      );
      this.widget6.errorsCount.next(
        this.getCountInArray(this.widget6.datasets[0].data)
      );
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

  onChangeValueWidget8(): void {
    const cuencaRandom = Math.floor(Math.random() * 5);
    const newDataMulti = this.widget8.data.slice();
    newDataMulti[cuencaRandom].value = Math.floor(Math.random() * 5000 + 1200);
    this.widget8.data = newDataMulti;
  }

  onChangeValueWidget9() {
    const newData = this.widget9.data.slice();
    newData.forEach(i => {
      i.value = Math.floor(Math.random() * 10000);
    });

    newData.sort((a, b) => b.value - a.value);
    this.widget9.max = this.getMaxUsageMeter(newData[0].value);
    this.widget9.data = newData;
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

  getRandomWidget7Data(){
    const result = [];
    const now = Date.now()
    const date = new Date(now);
    const cuencas = ["Cuenca 1", "Cuenca 2", "Cuenca 3"]
    const infLimit = now - (3 * 60 * 60 * 1000) - ((date.getMinutes() % 10) * 60*1000) - (date.getSeconds() * 1000)
    console.log(new Date(infLimit));
    for (let j=0; j < cuencas.length; j++  ){
      for(let i = 0; i < 18; i++){
        result.push(
          new DataWidget7(
            infLimit + (i * 10*60*1000),
            cuencas[j],
            Math.floor(Math.random() * 200 + 20),
            Math.floor(Math.random() * 120 + 15)
           )
        )
      }
    }
    return result;
  }
}
