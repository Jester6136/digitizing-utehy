import { Person } from './person';
import { Employee } from './employee';

export class User {

    public user_id: string;
    public department_id: string;
    public facility_id: string;
    public employee_code: string;
    public job_type: string;
    public hare_date: Date;
    public pin: string;
    public created_by_user_id: string;
    public created_date_time: Date;
    public lu_user_id: string;
    public lu_updated: Date;
    public active_flag: number;
    public print_name_e: string;
    public print_name_l: string;
    public objectjson_employee: Employee;
    public objectjson_person: Person;
    public access_token: string;
    public username: string;
    public password: string;
    public domain_name: string;
    public description: string;
    public description_e: string;
    public description_l: string;
    public token_type: string;
    public roles: any;
    public facilities: any;
    public permissions: any;
    public expires_in: number;
    public refresh_token: string;
    public issued: any;
    public expires: any;
    public confirm_password: string;

    constructor(access_token: string = null, user_id: string = null, username: string = null, full_name: string = null, avatar: string = null,
        expires_in: number = null, refresh_token: string = null, issued: any = null, expires: any = null, job_type_rcd: string = null,
        department_id: string = null, print_name_e: string = null, print_name_l: string = null) {
        this.access_token = access_token;
        this.user_id = user_id;
        this.username = username;
        this.objectjson_person = new Person();
        this.objectjson_person.full_name = full_name;
        this.objectjson_person.job_type_rcd = job_type_rcd;
        this.objectjson_employee = new Employee();
        this.objectjson_employee.avatar = avatar;
        this.expires_in = expires_in;
        this.refresh_token = refresh_token;
        this.department_id = department_id;
        this.issued = issued;
        this.expires = expires;
        this.print_name_e = print_name_e;
        this.print_name_l = print_name_l;
    }

}
