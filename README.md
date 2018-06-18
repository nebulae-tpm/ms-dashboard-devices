![NebulaE](docs/images/nebula.png "Nebula Engineering SAS")

# dashboard devices
The general porpouse of this service is to listen events from the "event store" and create a formatted object to persist in DB to can show by charts the summarized information of the devices connected to the platform.

_This MicroService is built on top of NebulaE MicroService Framework.  Please see the [FrameWork project](https://github.com/NebulaEngineering/nebulae) to understand the full concept_**.

![Intro](docs/images/ms-dashboard-devices_intro.png "Intro")

# Table of Contents
  * [Project Structure](#structure)
  * [FrontEnd](#frontend)
    *  [Charts available](#frontend_charts)
    *  [Environment variables](#frontend_env_vars) - not yet available  
  * [API](#api)
    * [GraphQL throught Gateway API](#api_gateway_graphql)
  * [BackEnd](#backend)
    *  [Recepcionist](#backend_recepcionist)
        *  [Environment variables](#backend_dashboard-devices)
    *  [Handler](#backend_handler)
        *  [Environment variables](#backend_handler_env_vars)
        *  [CronJobs](#backend_handler_cronjobs)
        *  [Event Sourcing](#backend_handler_eventsourcing)
  * [Prepare development environment](#prepare_dev_env)
  * [License](#license)

  # Project structure <a name="structure"></a>

```
├── frontend                            => Micro-FrontEnd  
│   └── emi                             => Micro-FrontEnd for [EMI FrontEnd](https://github.com/nebulae-tpm/emi) - not yet available  
├── api                                 => Micro-APIs  
│   └── gateway                         => Micro-API for [Gateway API](https://github.com/nebulae-tpm/gateway)  
├── backend                             => Micro-BackEnds  
│   ├── dashoard-devices                => Micro-BackEnd responsible for listen events useful for dasboard-devices miscroservice 
├── etc                                 => Micro-Service config Files.  
├── deployment                          => Automatic deployment strategies  
│   ├── compose                         => Docker-Compose environment for local development  
│   └── gke                             => Google Kubernetes Engine deployment file descriptors  
│   └── mapi-setup.json                 => Micro-API setup file  
├── .circleci                           => CircleCI v2. config directory
│   ├── config.yml
│   └── scripts
├── docs                                => Documentation resources  
│   └── images  
├── README.md                           => This doc
```
# Frontend <a name="frontend"></a>
Shows by charts the summarized information of the devices connected to the platform and device's transactions. In this webform is possible notice the quantity of devices with alarms in the range of one, two or three hours, to notice about the influx of user (success transactions)  by cueca in the range of one, two or three hours, to notice about the network status (online or offline) of all devices registered on the platform grouped by cuenca, to notice the success transactions Vs failed transactions in a chart grouped by cuenca in range of one, two or three hours.

## Charts available in Frontend <a name="frontend_charts"></a>
These are the exposed the charts available in the webform [Dashboard-devices frontend](https://github.com/nebulae-tpm/ms-dashboard-devices)

### Alarms card charts
There are four card of this type in webpage top, each one belong to CPU usage, RAM memory, Voltage and temperature alarms type. Each one have front and back side
#### front side
##### toggle-side-button
    Button to toggle the card side is located in the right-top of the card.
#####  Timerange selector
    Time range selector to show the quantity of alarms in the time range selected.
##### Number reported alarms
    Number of alarms of the corresponding alarm type reported by the EventStore in the selected time range.
##### Alarm type label
    Label to make known what the number in the card center refers to.
##### Device quantity with alarms
    Label to announce what is the quantity of devices with alarms and the total quantity of devices registred in the platform.    
#### back side
##### toggle-side-button
    Button to toggle the card side is located in the right-top of the card.
##### Top List
    List that allow to know what are the devices with most alarms quantity reported in the time range selected.
    Note: the user is allowed to see the device details clicking on each item of the list.
##### complete list button
    It allows to navigate to other component to see the complete list with the devices that reported alarms in the time range selected.

### Influx of user
This Chart allow at user to know the influx of user in the total system grouped by cuencas in two differents chart located in the front and back side
#### Front side
#### Back side

### ...

# API <a name="api"></a>
Exposed interfaces to send Commands and Queries by the CQRS principles.
The MicroService exposes its interfaces as Micro-APIs that are nested on the general API.

## GraphQL throught Gateway API <a name="api_gateway_graphql"></a>
These are the exposed GraphQL functions throught the [Gateway API](https://github.com/nebulae-tpm/gateway).  

Note: You may find the GraphQL schema [here](api/gateway/graphql/dashboard-devices/schema.gql)

### GraphQL Enums
* DashBoardDevicesAlarmReportTimeRangeType: Refers to the time ranges in [...]
    * ONE_HOUR : Last hour
    * TWO_HOURS: Last two hours
    * THREE_HOURS: Last three hours

* DashBoardDevicesDeviceNetworkStatus: Refers to network status
    * ONLINE: online status
    * OFFLINE: offline status

* DashBoardDevicesAlarmReportType: Refers to different alarm types
    * RAM_MEMORY
    * CPU_USAGE
    * VOLTAGE
    * TEMPERATURE

### GraphQL types
* DashBoardDevicesAlarmReportTopDevices: Top n Devices list for the DashBoardDevicesAlarmReport
    * sn: String! => device Serial Number,
    * hostname: String! => Device hostname
    * alarmsCount: Int! => Number of alarms reported by the device
    * deviceDetailLink: String => Link to navigate to the device info page

* DashBoardDevicesAlarmReportTimeRange : Object used to provide enoght data to each alarm cards
    * timeRange: DashBoardDevicesAlarmReportTimeRangeType! => current time range.
    * alarmsCount: Int! => Total alarms quantity
    * devicesCount: Int! => devices quantity that reports alarms.
    * order: Int! => the priority to show in the selection of timeRange option in the frontend
    * topDevices: [DashBoardDevicesAlarmReportTopDevices] => List of devices with the most quantity of alarms reported in the time range selected
    * fullDevicesListLink: String => not used [deprecated]

* DashBoardDevicesAlarmReport: Object to provide data to alarm card chart.
    * type: DashBoardDevicesAlarmReportType! => Alarm type
    * timeRanges: [DashBoardDevicesAlarmReportTimeRange] => Array with data for each time range
    * queriedTime: BigInt => query timestamp

* DashBoardDevicesNetworkEvent: Device Network status event type used for DashBoardDevices
    * state: DashBoardDevicesDeviceNetworkStatus! => Network status
    * serial: String! => Serial of device
    * hostname: String! => hostname of device
    * cuenca: String! => Cuenca to Device belongs

* DashBoardDeviceNetworkStatusSubSerie: Object used to represent subgroups data on devices online Vs offline chart
    * name: String! => serie name (Online, Offline)
    * value: Int! => serie value (quantity of devices online or offline) 

* DashBoardDeviceNetworkStatus: Object to provide data at device network status chart in DashboardDevices. (online Vs offline) chart
    * name: String! => Cuenca name used to show in devices on Vs devices off chart
    * series: [DashBoardDeviceNetworkStatusSubSerie]! => Custom object type to provide data to chart in DasboardDevice microservice

* DashboardDeviceTransaction: Device transaction
    * interval: BigInt! => 
    * groupName: String => Cuenca name which serves as a grouping criterion
    * transactions: Int! => Success transaction quantity 
    * errors: Int! => failed transaction quantity

* DashboardDeviceTransactionSucess: 
    * name: String! => Group or cuenca name
    * value: Int! => Success transaction quantity

* DashboardDeviceTransactionSucessArray: Object to provide data at influx of user chart
    * timeRange: String! => TimeRange of sucess transaction
    * data: [DashboardDeviceTransactionSucess]! => [...]

* DeviceTransactionsUpdatedEvent: Event that informs when it's necessary to update the device transaction stats
    * timestamp: BigInt! => timestamp

### GraphQL Queries
#### getDashBoardDevicesAlarmReport
    Get a report summary of alarmed devices to provide data to alarm card charts in Dashboard-devices
* Parms:
    * type: DashBoardDevicesAlarmReportType! => Alarm type
    * startTime: BigInt! => query timestamp
* returns : DashBoardDevicesAlarmReport object.

#### getDashBoardDevicesCurrentNetworkStatus
    Get data agrouped by groupName to show in Dashboard Devices online Vs Ofline
* Params : none
* returns : DashBoardDeviceNetworkStatus Array

#### getCuencaNamesWithSuccessTransactionsOnInterval
    get the group names list in wich success transactions were made
* params:
    * startDate: BigInt => lower limit date to search registries in the database
    * endDate: BigInt => higher limit date to search registries in the database
* returns: String array where each string is a group name

#### getSucessDeviceTransactionsGroupByGroupName
    get the sucess transactions grouped by Groupname 
* params: 
    * nowDate: BigInt! => query timestamp
* returns: DashboardDeviceTransactionSucessArray objects array

####  getDeviceTransactionsGroupByTimeInterval
    get the sucess and failed transactions grouped by Groupname
* params:
    * startDate: BigInt => Lower limit date to search registries in the database
    * endDate: BigInt => Higher limit date to search registries in the database
    * groupName: String => GroupName to filter
* returns: DashboardDeviceTransaction objects array

#### getDeviceDashBoardTotalAccount
    get total number of devices registred in the platform
* Params: none
* Return: Integer

### GraphQL Subscriptions
#### onDashBoardDeviceOnlineReported
    Executed when a Device is reported as online
* Data: DashBoardDeviceNetworkStatus object array

#### onDashBoardDeviceOfflineReported
    Executed when a Device is reported as offline
* Data: DashBoardDeviceNetworkStatus object array

#### onDashBoardDeviceCpuUsageAlarmActivated
    Executed when a device reports A CPU usage alarm
* Data: DashBoardDevicesAlarmReport object

#### onDashBoardDeviceRamMemoryAlarmActivated
    Executed when a device reports A RAM memory alarm
* Data: DashBoardDevicesAlarmReport object

#### onDashBoardDeviceTemperatureAlarmActivated
    Executed when a device reports A temperature alarm
* Data: DashBoardDevicesAlarmReport object

#### onDashBoardDeviceLowVoltageAlarmReported
    Executed when a device reports A low voltage alarm
* Data: DashBoardDevicesAlarmReport object

#### onDashBoardDeviceHighVoltageAlarmReported
    Executed when a device reports A high voltage alarm
* Data: DashBoardDevicesAlarmReport object

#### deviceTransactionsUpdatedEvent
    Executed when there is new available data to show in charts about transactions
* Data: DeviceTransactionsUpdatedEvent object

### GraphQL Mutations
    N/A
# BackEnd <a name="backend"></a>
Backends are defined processes within a docker container.  
Each process is responsible to build, run and maintain itself.  

Each BackEnd has the following running commands:
  * npm start: executes main program
  * npm run prepare: execute maintenance routines such DB indexes creation
  * npm run sync-state:  syncs backend state by reading all missing Events from the event-store
  * npm test: runs unit tests

## Devices location <a name="backend_dashboard-devices"></a>







