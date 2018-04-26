import { query } from "@angular/animations";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
// tslint:disable-next-line:import-blacklist
import * as Rx from "rxjs";
import { GatewayService } from "../../../api/gateway.service";
import {
  getDashBoardDevicesAlarmReport,
  onDasboardDeviceOnlineReported,
  onDasboardDeviceOfflineReported,
  getDevicesOnlineVsOffline,
  onDeviceCpuUsageAlarmActivated,
  onDeviceRamMemoryAlarmActivated,
  onDeviceTemperatureAlarmActivated
} from "./gql/DashBoardDevices";

@Injectable()
export class DashboardDevicesService {
  constructor(private http: HttpClient, private gateway: GatewayService) {}

  getDashboardDeviceAlertsBy(alarmType: string) {
    return this.gateway.apollo.watchQuery<any>({
      query: getDashBoardDevicesAlarmReport,
      variables: {
        type: alarmType
      }
    }).valueChanges;
  }

  getDashboardDeviceNetworkStatusEvents(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo.subscribe({
        query: onDasboardDeviceOnlineReported
      })
      .map(resp => resp.data.onDeviceOnlineReported),
      this.gateway.apollo.subscribe({
        query: onDasboardDeviceOfflineReported
      })
      .map(resp => resp.data.onDeviceOfflineReported)
    ).throttleTime(2000);
  }

  getDevicesOnlineVsOffline() {
    return this.gateway.apollo.watchQuery<any>({
      query: getDevicesOnlineVsOffline
    }).valueChanges.map(result => result.data.getDashBoardDevicesCurrentNetworkStatus)
  }

  listenDashboardDeviceCpuAlarmsEvents(): Observable<any>{
    return Rx.Observable.merge(
      this.gateway.apollo.subscribe({
        query: onDeviceCpuUsageAlarmActivated
      })
      .map(resp => resp.data.onDeviceCpuUsageAlarmActivated)
    ).throttleTime(2000);
  }

  listenDashboardDeviceRamMemoryAlarmsEvents(): Observable<any>{
    return Rx.Observable.merge(
      this.gateway.apollo.subscribe({
        query: onDeviceRamMemoryAlarmActivated
      })
      .map(resp => resp.data.onDeviceRamMemoryAlarmActivated)
    ).throttleTime(2000);
  }

  listenDashboardDeviceTemperatureAlarmsEvents(): Observable<any>{
    return Rx.Observable.merge(
      this.gateway.apollo.subscribe({
        query: onDeviceTemperatureAlarmActivated
      })
      .map(resp => resp.data.onDeviceTemperatureAlarmActivated)
    ).throttleTime(2000);
  }

}
