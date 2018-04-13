import { query } from '@angular/animations';
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
import {
  getDashBoardDevicesAlarmReport
}  from './gql/DashBoardDevices';

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

  constructor( private http: HttpClient, private gateway: GatewayService ) {
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
      Promise.all([]).then(() => {
        resolve();
      }, reject);
    });
  }

  // getDummyData() {
  //   console.log(`%%%%%%%%%%${JSON.stringify(DashBoardDevices)}%%%%%%%%%%%%%`);
  //   this.gateway.apollo.watchQuery<any>({
  //     query: DashBoardDevices
  //   })
  //     .valueChanges
  //     .subscribe(
  //       (result) => { console.log(result.data.getDashBoardDevicesAlarmReport) },
  //       (error) => { console.error('@@@@@@@@@@@@@@@@@@@@@@@@@',error); },
  //       () => { console.log('COMPLETED') },
  //   );
  //   return this.reportData;
  // }

  getDashboardDeviceAlertsBy(alarmType: string) {
   return this.gateway.apollo.watchQuery<any>({
      query: getDashBoardDevicesAlarmReport,
      variables: {
        type: alarmType
      }
    }).valueChanges;
  }
}


