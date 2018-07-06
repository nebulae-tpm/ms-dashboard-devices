import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'timeRangeKeys'})
export class RangeTimeKeys implements PipeTransform
{
    transform(timeRanges: any[], args: string[]): any
    {
      const keys: any[] = [];
      timeRanges.forEach((item, index) => {
        keys.push({
          key: item.timeRange,
          index: index,
          value: item
        });
      });
      return keys;
    }
}

@Pipe({name: 'timeRangeKeysWithtoLocaleString'})
export class TimeRangeKeysWithtoLocaleString implements PipeTransform
{
    transform(timeRanges: any[], args: string[]): any
    {
      const keys: any[] = [];
      timeRanges.forEach((item, index) => {
        const [firstLimit, lastLimit] = item.timeRange.split(',');
        const firstLimitLabel = new Date(parseInt(firstLimit)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric',  hour12: false });
        const lastLimitLabel = new Date(parseInt(lastLimit)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric',  hour12: false });
        keys.push({
          key: firstLimitLabel + ' -- ' + lastLimitLabel,
          index: index,
          value: item
        });
      });
      return keys;
    }
}
