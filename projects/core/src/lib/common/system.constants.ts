import { Inject, Injectable } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Injectable()
export class SystemConstants {
    [key: string]: any;
    public static config: any = {};
    public static BASE_API = '';
    public static IMAGE_API = '';
    public static PATH = '';
    constructor(@Inject('env') env: any) {
        SystemConstants.BASE_API = env.BASE_API;
        SystemConstants.IMAGE_API = env.IMAGE_API;
        SystemConstants.PATH = '../../../assets/config.prod.json';
    }
    public static get(name: string): any {
        if (!this.config || Object.keys(this.config).length == 0) {
            let _configService = new ConfigService();
            this.config = _configService.loadJSON(SystemConstants.PATH);
        }
        return this.config[name];
    }

}
