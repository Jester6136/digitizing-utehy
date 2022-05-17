import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replace'
})

export class ReplacePipe implements PipeTransform {

    transform(value: string, args: string[]): string {
        if (!value || value == '') {
            return '';
        }
        const regex = new RegExp(`[${args[0]}]`, 'g');
        return value.replace(regex, args[1]);
    }

}
