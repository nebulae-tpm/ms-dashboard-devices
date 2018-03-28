import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import {
  DummyReportData,
  DummyDevice,
  DummyCuenca,
  DummyVehicle
} from './dummyData';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs';

@Injectable()
export class OnOffByRouteDashboardService implements Resolve<any> {
  projects: any[];
  widgets: any[];
  widgets2: any[];

  reportData: DummyReportData[] = [];
  devices: DummyDevice[] = [];
  cuencas: DummyCuenca[] = [];
  vehicles: DummyVehicle[] = [];

  dataReady = new Rx.Subject();

  constructor(private http: HttpClient) {
    // console.log('CREATING CUANCAS');
    // for (let i = 0; i < 10; i++) {
    //   this.cuencas.push(new DummyCuenca());
    // }
    // console.log('CREATIN DEVICES');
    // for (let i = 0; i < 5000; i++) {
    //   this.devices.push(new DummyDevice());
    // }
    // console.log('CREATING VEHICLES');
    // for (let i = 0; i < 100; i++) {
    //   this.vehicles.push(new DummyVehicle());
    // }

    // // simulating data 15 minutes ago
    // console.log('simulating data 15 minutes ago');
    // for (let i = 0; i < this.devices.length; i++) {
    //   const now = Date.now();
    //   for (let j = 300; j >= 0; j = j - 5) {
    //     this.reportData.push(
    //       new DummyReportData(
    //         now * 1000 - j,
    //         this.devices[i].deviceId,
    //         this.cuencas[
    //           Math.floor(Math.random() * this.cuencas.length - 1 + 1)
    //         ].name,
    //         Math.floor(Math.random() * 50 + 1),
    //         Math.floor(Math.random() * 10 + 1),
    //         Math.floor(Math.random() * 100 + 1),
    //         'TKM909'
    //       )
    //     );
    //   }
    // }
    console.log('Dummy data creada');
  }

  /**
   * Resolve
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([this.getProjects(), this.getWidgets(), this.getWidgets2()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getProjects(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get('emi/api/project-dashboard-projects')
        .subscribe((response: any) => {
          this.projects = response;
          resolve(response);
        }, reject);
    });
  }

  getWidgets(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get('emi/api/e-commerce-dashboard').subscribe((response: any) => {
        this.widgets = response;
        resolve(response);
      }, reject);
    });
  }
  getWidgets2(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get('emi/api/analytics-dashboard-widgets')
                .subscribe((response: any) => {
                    this.widgets2 = response;
                    resolve(response);
                }, reject);
        });
    }

  getDummyData() {
    return this.reportData;
  }
}
