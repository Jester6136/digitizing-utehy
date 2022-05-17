import { Pipe, PipeTransform } from '@angular/core';
import { SystemConstants } from '../common/system.constants';
import * as mjs from 'mathjs';

const PADDING = '000000';

@Pipe({ name: 'plThousand' })
export class PLThousandPipe implements PipeTransform {

    private DECIMAL_SEPARATOR: string;
    private THOUSANDS_SEPARATOR: string;

    constructor() {
        this.DECIMAL_SEPARATOR = SystemConstants.get('DECIMAL_SEPARATOR');
        this.THOUSANDS_SEPARATOR = SystemConstants.get('THOUSANDS_SEPARATOR');
    }

    addSeparator(nStr: any) {
        if (mjs.typeOf(nStr) == 'Fraction') {
            return mjs.format(nStr, { fraction: 'ratio' });
        }
        nStr += '';
        let x = nStr.replace(new RegExp(this.THOUSANDS_SEPARATOR, 'gi'), '').split(this.DECIMAL_SEPARATOR);
        let x1 = x[0];
        let x2 = x.length > 1 ? this.DECIMAL_SEPARATOR + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + this.THOUSANDS_SEPARATOR + '$2');
        }
        return x1 + x2;
    }

    transform(value: any): string {
        if (!value || value == '') {
            return '0';
        }
        return this.addSeparator(value);
    }

    parse(value: any): number {
        return parseFloat(value.replace(new RegExp(this.THOUSANDS_SEPARATOR, 'gi'), ''));
    }

}
