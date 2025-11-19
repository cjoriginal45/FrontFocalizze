import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mentionLinker'
})
export class MentionLinkerPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
