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

// Gets the devices transactions group by time intervals of 10 minutes
export const getDeviceTransactionsGroupByTimeInterval = gql`
  query getDeviceTransactionsGroupByTimeInterval($startDate: BigInt, $endDate: BigInt, $groupName: String ){
    getDeviceTransactionsGroupByTimeInterval(startDate: $startDate, endDate: $endDate, groupName: $groupName){
      interval
      transactions
      errors
    }
  }
`;

// Gets the devices transactions group by group name and time intervals of 10 minutes
export const getDeviceTransactionsGroupByIntervalAndGroupName = gql`
  query getDeviceTransactionsGroupByIntervalAndGroupName($startDate: BigInt, $endDate: BigInt){
    getDeviceTransactionsGroupByIntervalAndGroupName(startDate: $startDate, endDate: $endDate)
  }
`;

/**
 * DeviceConnected event subscription
 */
export const onDasboardDeviceOnlineReported = gql`
  subscription{
    onDashBoardDeviceOnlineReported{
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
    onDashBoardDeviceOfflineReported{
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
    onDashBoardDeviceCpuUsageAlarmActivated {
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
    onDashBoardDeviceRamMemoryAlarmActivated {
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
    onDashBoardDeviceTemperatureAlarmActivated {
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

export const onDeviceLowVoltageAlarmActivated = gql`
  subscription {
    onDashBoardDeviceLowVoltageAlarmReported {
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

export const onDeviceHighVoltageAlarmActivated = gql`
  subscription {
    onDashBoardDeviceHighVoltageAlarmReported {
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
export const getSucessDeviceTransactionsGroupByGroupName = gql`
query getSucessDeviceTransactionsGroupByGroupName{
  getSucessDeviceTransactionsGroupByGroupName{
    timeRange
    data{
      name
      value
    }
  }
}
`;

export const  deviceTransactionsUpdatedEvent = gql`
  subscription {
  deviceTransactionsUpdatedEvent{
    timestamp
  }
}
`;


export const getDeviceDashBoardTotalAccount = gql`
query getDeviceDashBoardTotalAccount{
  getDeviceDashBoardTotalAccount
}
`;
