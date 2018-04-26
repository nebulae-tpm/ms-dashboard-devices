import gql from "graphql-tag";

// We use the gql tag to parse our query string into a query document

export const getDashBoardDevicesAlarmReport = gql`
  query getAlarmReportByType($type: DashBoardDevicesAlarmReportType!){
    getDashBoardDevicesAlarmReport(type: $type){
      type,
      timeRanges {
        timeRange,
        alarmsCount,
        devicesCount,
        order,
        topDevices{
          sn,
          hostname,
          alarmsCount,
          deviceDetailLink
        },
        fullDevicesListLink
      }
    }
  }
`;
export const onDashBoardDeviceAlarmChanged = gql `
subscription onDashBoardDevicesAlarmReportChanged($type: DashBoardDevicesAlarmReportType!){
  onDashBoardDevicesAlarmReportChanged(type: $type){
    type,
    timeRanges {
      timeRange,
      alarmsCount,
      devicesCount,
      order,
      topDevices{
        sn,
        hostname,
        alarmsCount,
        deviceDetailLink
      },
      fullDevicesListLink
    }
  }
}`;

/**
 * DeviceConnected event subscription
 */
export const onDasboardDeviceOnlineReported = gql`
  subscription{
  onDeviceOnlineReported{
    name
    series{
      name value
    }
  }
}`;

/**
 * DeviceDisconnected event subscription
 */
export const onDasboardDeviceOfflineReported = gql`
  subscription{
    onDeviceOfflineReported{
    name
    series{
      name value
    }
  }
}`;


export const getDevicesOnlineVsOffline = gql`
  query getDevicesOnlineVsOffline{
  getDashBoardDevicesCurrentNetworkStatus{
    name,
    series{
      name,
      value
    }
  }
}`;

export const onDeviceCpuUsageAlarmActivated = gql`
  subscription {
    onDeviceCpuUsageAlarmActivated {
      type
      timeRanges {
        timeRange
        alarmsCount
        devicesCount
        order
        topDevices {
          sn
          hostname
          alarmsCount
          deviceDetailLink
        }
        fullDevicesListLink
      }
    }
  }
`;

export const onDeviceRamMemoryAlarmActivated = gql`
  subscription {
    onDeviceRamMemoryAlarmActivated {
      type
      timeRanges {
        timeRange
        alarmsCount
        devicesCount
        order
        topDevices {
          sn
          hostname
          alarmsCount
          deviceDetailLink
        }
        fullDevicesListLink
      }
    }
  }
`;

export const onDeviceTemperatureAlarmActivated = gql`
  subscription {
    onDeviceTemperatureAlarmActivated {
      type
      timeRanges {
        timeRange
        alarmsCount
        devicesCount
        order
        topDevices {
          sn
          hostname
          alarmsCount
          deviceDetailLink
        }
        fullDevicesListLink
      }
    }
  }
`;






