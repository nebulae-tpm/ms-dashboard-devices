import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'timeRangeKeys'})
export class RangeTimeKeys implements PipeTransform
{
    transform(timeRanges: any[], args: string[]): any
    {
      const keys: any[] = [];
      timeRanges.filter(i => i.timeRange).forEach((item, index) => {
        keys.push({
          key: item.timeRange,
          index: index,
          value: item
        });
      });
      return keys;
    }
}
