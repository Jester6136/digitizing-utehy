import { Pipe, PipeTransform } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { TranslateService } from '@ngx-translate/core';
import { FunctionConstants } from '../common/function.constants';

@Pipe({ name: 'replaceToday' })
export class ReplaceTodayPipe implements PipeTransform {

    str_yesterday: string;
    str_today: string;
    str_tomorrow: string;

    constructor(private _translateService: TranslateService, private _functionConstants: FunctionConstants) {
        this._translateService.get([
            'COMMON.dp_yesterday',
            'COMMON.dp_today',
            'COMMON.dp_tomorrow'
        ]).subscribe(msg => {
            this.str_yesterday = msg['COMMON.dp_yesterday'];
            this.str_today = msg['COMMON.dp_today'];
            this.str_tomorrow = msg['COMMON.dp_tomorrow'];
        });

    }

    transform(value: string, args?: any[]) {
        if (!args || args.length == 0 || !args['scheduled_time']) {
            return value;
        } else {
            let scheduled_time = new Date(args['scheduled_time']);
            let arrDateTime = value.split(' ');
            let scheduled = new Date(scheduled_time.getFullYear(), scheduled_time.getMonth(), scheduled_time.getDate());
            let now = new Date();
            now.setHours(0, 0, 0, 0);
            let day_diff = this._functionConstants.diffDate(scheduled, now, 'day', false);
            switch (day_diff) {
                case -1: arrDateTime[0] = this.str_yesterday; break;
                case 0: arrDateTime[0] = this.str_today; break;
                case 1: arrDateTime[0] = this.str_tomorrow; break;
            }
            return arrDateTime.join(' ');
        }
    }

}
