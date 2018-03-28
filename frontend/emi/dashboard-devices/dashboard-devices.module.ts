import { ChartjsComponent } from './chartjs/chartjs.component';
import { ChartjsService } from './chartjs/chartjs.service';
import { OnOffByRouteDashboardComponent } from './onOffByRoute/onOffByRoute.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';

import { DashboardDevicesComponent } from './dashboard-devices.component';
import { DashboardDevicesService } from './dashboard-devices.service';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { OnOffByRouteDashboardService } from './onOffByRoute/onOffByRoute.service';

const routes: Routes = [

  {
    path: 'G0',
    component: DashboardDevicesComponent,
  },
  {
    path: 'G1',
    component: OnOffByRouteDashboardComponent,
  },
  {
    path: 'chartjs',
    component: ChartjsComponent,
  },
  {
    path: '**',
    redirectTo: 'G1'
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    FuseWidgetModule,
    NgxChartsModule
  ],
  declarations: [DashboardDevicesComponent, OnOffByRouteDashboardComponent, ChartjsComponent],
  providers: [DashboardDevicesService, OnOffByRouteDashboardService, ChartjsService]
})
export class DashboardDevicesModule {}
