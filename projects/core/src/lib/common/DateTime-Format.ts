export class DateTimeFormat {
    formatDatetime(timestring: string, format: string) {
        let d = new Date();
        let arr = timestring.split('/').map(function (item) {
            return parseInt(item);
        });
        let arrfm = format.split('/');
        let indexy = arrfm.indexOf('yyyy');
        let indexm = arrfm.indexOf('MM');
        let indexd = arrfm.indexOf('dd');
        d.setFullYear(arr[indexy], arr[indexm] - 1, arr[indexd]);
        let index = arrfm.indexOf('HH');
        d.setHours(arr[index]);
        index = arrfm.indexOf('mm');
        d.setMinutes(arr[index]);
        index = arrfm.indexOf('ss');
        d.setSeconds(arr[index]);
        return d;
    }
    DateDiff(date1: Date, date2: Date)  {
        return date1.getTime() - date2.getTime();
    }
}
