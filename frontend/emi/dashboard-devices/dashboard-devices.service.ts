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
  onDeviceTemperatureAlarmActivated,
  onDeviceLowVoltageAlarmActivated,
  onDeviceHighVoltageAlarmActivated,
  getDeviceTransactionsGroupByTimeInterval,
  getDeviceTransactionsGroupByIntervalAndGroupName,
  getSucessDeviceTransactionsGroupByGroupName,
  deviceTransactionsUpdatedEvent,
  getDeviceDashBoardTotalAccount
} from "./gql/DashBoardDevices";

@Injectable()
export class DashboardDevicesService {
  constructor(private http: HttpClient, private gateway: GatewayService) {}

  /**
   * Gets the devices transaction between two dates group by time intervals
   * @param startDate Start date
   * @param endDate End date
   */
  getDeviceTransactionsGroupByTimeInterval(startDate: number, endDate: number, cuencaName: string) {
    return this.gateway.apollo.watchQuery<any>({
      query: getDeviceTransactionsGroupByTimeInterval,
      fetchPolicy: 'network-only',
      variables: {
        startDate: startDate,
        endDate: endDate,
        groupName: cuencaName
      }
    }).valueChanges
  }

   /**
   * Gets the devices transaction between two dates group by group name and time intervals
   * @param startDate Start date
   * @param endDate End date
   */
  getDeviceTransactionsGroupByIntervalAndGroupName(startDate: number, endDate: number) {
    return this.gateway.apollo.watchQuery<any>({
      query: getDeviceTransactionsGroupByIntervalAndGroupName,
      variables: {
        startDate: startDate,
        endDate: endDate
      }
    }).valueChanges
    .map(respond => respond.data.getDeviceTransactionsGroupByIntervalAndGroupName)
  }

  getDashboardDeviceAlertsBy(alarmType: string) {
    return this.gateway.apollo.watchQuery<any>({
      query: getDashBoardDevicesAlarmReport,
      variables: {
        type: alarmType
      }
    }).valueChanges
  }

  getAllDevicesAccount(){
    return this.gateway.apollo.watchQuery<any>({
      query: getDeviceDashBoardTotalAccount
    }).valueChanges
    .map(result => result.data.getDeviceDashBoardTotalAccount);
  }

  /**
   * Listen the changes on devices network status
   */
  getDashboardDeviceNetworkStatusEvents(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo
        .subscribe({
          query: onDasboardDeviceOnlineReported
        })
        .map(resp => resp.data.onDashBoardDeviceOnlineReported),
      this.gateway.apollo
        .subscribe({
          query: onDasboardDeviceOfflineReported
        })
        .map(resp => resp.data.onDashBoardDeviceOfflineReported)
    )
  }

  getDevicesOnlineVsOffline() {
    return this.gateway.apollo
      .watchQuery<any>({
        query: getDevicesOnlineVsOffline
      })
      .valueChanges.map(
        result => result.data.getDashBoardDevicesCurrentNetworkStatus
      );
  }

  listenDashboardDeviceCpuAlarmsEvents(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo
        .subscribe({
          query: onDeviceCpuUsageAlarmActivated
        })
        .map(resp => resp.data.onDashBoardDeviceCpuUsageAlarmActivated)
    )
  }

  listenDashboardDeviceRamMemoryAlarmsEvents(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo
        .subscribe({
          query: onDeviceRamMemoryAlarmActivated
        })
        .map(resp => resp.data.onDashBoardDeviceRamMemoryAlarmActivated)
    )
  }

  listenDashboardDeviceTemperatureAlarmsEvents(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo
        .subscribe({
          query: onDeviceTemperatureAlarmActivated
        })
        .map(resp => resp.data.onDashBoardDeviceTemperatureAlarmActivated)
    )
  }

  listenDashboardDeviceVoltageAlarmsEvents(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo
        .subscribe({
          query: onDeviceLowVoltageAlarmActivated
        })
        .map(resp => resp.data.onDashBoardDeviceLowVoltageAlarmReported),
      this.gateway.apollo
        .subscribe({
          query: onDeviceHighVoltageAlarmActivated
        })
        .map(resp => resp.data.onDashBoardDeviceHighVoltageAlarmReported)
    )
  }

  listenDeviceTransactionsUpdates(){
   return this.gateway.apollo.subscribe({
      query: deviceTransactionsUpdatedEvent
    })
    .map(response => response.data.deviceTransactionsUpdatedEvent)
    // .mapTo(this.getSucessTransactionsGroupByGroupName())
  }

  getSucessTransactionsGroupByGroupName(){
    return this.gateway.apollo.query<any>({
      query: getSucessDeviceTransactionsGroupByGroupName,
      fetchPolicy: 'network-only'
    })
    .map(result => result.data.getSucessDeviceTransactionsGroupByGroupName)
  }
}
