import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'timeRangeKeys'})
export class RangeTimeKeys implements PipeTransform
{
    transform(timeRanges: any[], args: string[]): any
    {
      console.log(timeRanges);
      const keys: any[] = [];
      timeRanges.filter(i => i.timeRange).forEach((item, index) => {
        console.log(item);
        keys.push({
          key: item.timeRange,
          index: index,
          value: item
        });
      });
      console.log('Final keys', keys);
      return keys;
    }
}
