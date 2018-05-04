import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cuencaKeys'})
export class cuencaSelectionKeys implements PipeTransform
{
    transform(cuencas: any[], args: string[]): any
    {
      const keys: any[] = [];
      cuencas.forEach((item, index) => {
        keys.push({
          key: item.name,
          index: index,
          value: item.name
        });
      });
      return keys;
    }
}
