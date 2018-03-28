import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs';
import { DeviceCommon } from './data';
import { DummyCuenca, DummySN, DummyVehicle, DummyDevice, DummyTransactionPack } from './dummyData';

@Injectable()
export class ChartjsService implements Resolve<any> {
  public onTransactionArrived$ = new Rx.Subject <any>();
  cuencas: DummyCuenca[] = [];
  vehicles: DummyVehicle[] = [];
  SNs: DummySN[] = [];
  Devices: DummyDevice[] = [];


  vehiclesMax = 5000;
  SN_Max = 5000;
  cuencaMax = 5;
  devicesMax = 5000;

  lastReportTime = Date.now();


  constructor(private http: HttpClient) {

    for (let i = 0; i < this.vehiclesMax; i++) {
      this.vehicles.push(new DummyVehicle());
    }
    for (let i = 0; i < this.SN_Max; i++) {
      this.SNs.push(new DummySN());
    }
    for (let i = 0; i < this.cuencaMax; i++) {
      this.cuencas.push(new DummyCuenca());
    }
    const ramOptions =  [1024, 2048, 4096];
    const cpuCoresOptions = [2, 4, 8];

    for (let i = 0; i < this.devicesMax; i++) {
      this.Devices.push(
        new DummyDevice(
          this.SNs[i].SN,
          this.vehicles[i].plate,
          this.cuencas[Math.floor((Math.random() * this.cuencaMax ))].name,
          Date.now(),
          cpuCoresOptions[Math.floor((Math.random() * cpuCoresOptions.length ))],
          ramOptions[Math.floor((Math.random() * ramOptions.length ))]
        )
      );
    }

    // hacer envios de paquetes de transacciones
    Rx.Observable.interval(2000).subscribe((reportCounter) => {
      const devicesSelected_max = 300;
      const devicesSelected = [];
      while (devicesSelected.length < devicesSelected_max) {
        const posibleDevice = Math.floor((Math.random() * this.Devices.length ));
        if ( devicesSelected.indexOf(posibleDevice) === -1 ) {
          devicesSelected.push(posibleDevice);
        }
      }

      devicesSelected.forEach(index => {
        const now = Date.now();
        const device = this.Devices[index];
        device.lastConection = now;
        const transactionPack = new DummyTransactionPack(
          device, this.lastReportTime, now,
          Math.floor((Math.random() * 50) + 10 ),
          Math.floor((Math.random() * 10 )));
        this.lastReportTime = now;
        this.onTransactionArrived$.next( transactionPack );
      });

    });


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

  getTransactionUpdates(){
    return this.onTransactionArrived$;
  }


}
