import { DashboardDevicesComponent } from './dashboard-devices.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';
import { DatePipe } from '@angular/common';

import { FuseWidgetModule } from '../../../core/components/widget/widget.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardDevicesService } from './dashboard-devices.service';
import { RangeTimeKeys, TimeRangeKeysWithtoLocaleString } from './pipes/timeRangeKeys.pipe';
import { SelectedItemDirective } from './dashboard-devices.directive';

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
  declarations: [
    DashboardDevicesComponent,
    RangeTimeKeys,
    TimeRangeKeysWithtoLocaleString,
    SelectedItemDirective
  ],
  providers: [ DashboardDevicesService, DatePipe]
})
export class DashboardDevicesModule {}
