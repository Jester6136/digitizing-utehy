import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceString' })
export class ReplaceStringPipe implements PipeTransform {
    transform(value: string, args?: any[]): string {
        for (let key in args) {
            value = value.replace('{' + key + '}', args[key]);
        }
        return value;
    }
}
