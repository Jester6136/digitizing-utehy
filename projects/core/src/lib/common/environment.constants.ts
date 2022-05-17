import { ConfigService } from '../services/config.service';

export class EnvironmentConstants {

    public static config: any = {};

    [key: string]: any;

    public static get(name: string): any {
        if (!this.config || Object.keys(this.config).length == 0) {
            let _configService = new ConfigService();
            this.config = _configService.loadJSON('../../../assets/environment.json');
        }
        return this.config[name];
    }

}
