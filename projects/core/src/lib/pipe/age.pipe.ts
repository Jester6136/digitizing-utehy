import { Pipe, PipeTransform } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
declare let moment: any;

@Pipe({
    name: 'age'
})
export class AgePipe implements PipeTransform {

    transform(value: Date): string {
        let today = moment();
        let birthdate = moment(value);
        return today.diff(birthdate, 'years').toString();
    }

}
