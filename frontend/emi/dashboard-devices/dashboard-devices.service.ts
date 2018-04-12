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
} from './dummyData/dummyData';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs';
import { GatewayService } from '../../../api/gateway.service';
import {DashBoardDevicesTest}  from './gql/DashBoardDevicesTest';

@Injectable()
export class DashboardDevicesService implements Resolve<any> {
  projects: any[];
  widgets: any[];
  widgets2: any[];

  reportData: DummyReportData[] = [];
  devices: DummyDevice[] = [];
  cuencas: DummyCuenca[] = [];
  vehicles: DummyVehicle[] = [];

  dataReady = new Rx.Subject();

  constructor(private http: HttpClient, private gateway: GatewayService) {

    
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
  getWidgets2(): Promise<any> {    
    return new Promise((resolve, reject) => {
      this.http.get('emi/api/analytics-dashboard-widgets')
        .subscribe((response: any) => {
          this.widgets2 = response;
          resolve(response);
        }, reject);
    });
  }

  getDummyData() {
    console.log(`%%%%%%%%%%${JSON.stringify(DashBoardDevicesTest)}%%%%%%%%%%%%%`);
    this.gateway.apollo.watchQuery<any>({
      query: DashBoardDevicesTest
    })
      .valueChanges
      .subscribe(
        (data) => { console.log(JSON.stringify(data)) },
        (error) => { console.error('@@@@@@@@@@@@@@@@@@@@@@@@@',error); },
        () => { console.log('COMPLETED') },
    );
    return this.reportData;
  }
}


