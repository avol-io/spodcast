import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    const much = args[0] || 'full';
    if (much == 'full') {
      return value;
    }
    return value.substring(0, Number.parseInt('' + much)) + '...';
  }
}
