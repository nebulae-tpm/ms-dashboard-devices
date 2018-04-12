import { DashboardDevicesComponent } from './dashboard-devices.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';

import { FuseWidgetModule } from '../../../core/components/widget/widget.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardDevicesService } from './dashboard-devices.service';

const routes: Routes = [
  {
    path: '',
    component: DashboardDevicesComponent,
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    FuseWidgetModule,
    NgxChartsModule
  ],
  declarations: [ DashboardDevicesComponent ],
  providers: [ DashboardDevicesService ]
})
export class DashboardDevicesModule {}
