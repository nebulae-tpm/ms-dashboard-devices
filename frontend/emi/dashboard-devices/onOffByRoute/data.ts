export const data = [
  {
    'name': 'Cuenca1',
    'value': 34
  },
  {
    'name': 'Cuenca2',
    'value': 25
  },
  {
    'name': 'Cuenca3',
    'value': 67
  }
];

export const dataDevicesOnVsOff = [

  {
    'name': 'Cuenca 1',
    'series': [
    {
      'name': 'offline',
      'value': 30
    },
    {
      'name': 'online',
      'value': 85
    }
    ]
  },
  {
    'name': 'Cuenca 2',
    'series': [
    {
      'name': 'offline',
      'value': 21
    },
    {
      'name': 'online',
      'value': 35
    }
    ]
  },
  {
    'name': 'Cuenca 3',
    'series': [
    {
      'name': 'offline',
      'value': 70
    },
    {
      'name': 'online',
      'value': 38
    }
    ]
  },
  {
    'name': 'Cuenca 4',
    'series': [
    {
      'name': 'offline',
      'value': 18
    },
    {
      'name': 'online',
      'value': 43
    }
    ]
  },
  {
    'name': 'Cuenca 6',
    'series': [
    {
      'name': 'offline',
      'value': 95
    },
    {
      'name': 'online',
      'value': 152
    }
    ]
  }
];

export const multi = [
  {
    'name': 'Germany',
    'series': [
      {
        'name': '2010',
        'value': 7300000
      },
      {
        'name': '2011',
        'value': 8940000
      }
    ]
  },

  {
    'name': 'USA',
    'series': [
      {
        'name': '2010',
        'value': 7870000
      },
      {
        'name': '2011',
        'value': 8270000
      }
    ]
  },

  {
    'name': 'France',
    'series': [
      {
        'name': '2010',
        'value': 5000002
      },
      {
        'name': '2011',
        'value': 5800000
      }
    ]
  }
];

export const writeErrosVsUsages = [
  {
    name: 'Errores',
    value: 134
  },
  {
    name: 'Usos',
    value: 834
  }
];


export const stressData = {
  datasets: [
    {
      label: 'Cuenca 1',
      fill: 'start',
      data: [12, 11, 45, 85, 69, 58, 45, 14, 99, 12, 47, 45]
    },
    {
      label: 'Cuenca 2',
      fill: 'start',
      data: [52, 45, 85, 69, 25, 19, 36, 45, 58, 14, 25, 85]
    }
  ],
  labels: ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
  colors: [
    {
      backgroundColor: '#3949ab',
      borderColor: '#3949ab',
      pointBackgroundColor: '#3949ab',
      pointBorderColor: '#ffffff',
      pointHoverBackgroundColor: '#3949ab',
      pointHoverBorderColor: '#ffffff',
    },
    {
      backgroundColor: 'rgba(30, 136, 229, 0.87)',
      borderColor: 'rgba(30, 136, 229, 0.87)',
      pointBackgroundColor: 'rgba(30, 136, 229, 0.87)',
      pointBorderColor: '#ffffff',
      pointHoverBackgroundColor: 'rgba(30, 136, 229, 0.87)',
      pointHoverBorderColor: '#ffffff'
    }
  ],
  options: {
    elements: {
      point: {
        borderWidth: 2,
        hoverBorderWidth: 2,
        hoverRadius: 4,
        radius: 4,
      }
    },
    layout: {
      padding : { left: 24, right: 32 }
    },
    legend: { display: false },
    maintainAspectRatio: false,
    plugings: {
      filler: {
        propagate: false
      }
    },
    scales: {
      xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            fontColor: 'rgba(0,0,0,0.54)'
          }
        }],
      yAxes: [{
          gridLines: {
            tickMarkLength: 16
          },
          ticks: {
            stepSize: 100
          }
      }]
    },
    spanGaps: false,
    tooltips: {
      intersect: false,
      mode: 'index',
      position: 'nearest'
    }

  },
  chartType: 'line'

};

export const topDeviceList = [
  {
    'name': 'Device MTG908',
    'quantity': 12
  },
  {
    'name': 'Device FGT345',
    'quantity': 33
  },
  {
    'name': 'Device VKY258',
    'quantity': 80
  }
];



