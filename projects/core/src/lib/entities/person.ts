import { Employee } from './employee';
import { User } from './user';

export class Person {
    public id: string;
    public person_code: string;
    public first_name: string;
    public middle_name: string;
    public last_name: string;
    public full_name: string;
    public gender: number;
    public date_of_birth: Date;
    public place_of_birth_l: string;
    public place_of_birth_e: string;
    public place_of_birth: string;
    public place_of_work: string;
    public country_of_nationalty: string;
    public nationality_country_rcd: string;
    public residence_country_rcd: string;
    public home_phone: string;
    public mobile_phone: string;
    public fax: string;
    public email: string;
    public home_address_l: string;
    public home_address_e: string;
    public home_address: string;
    public short_home_address_l: string;
    public short_home_address_e: string;
    public short_home_address: string;
    public residence_address_l: string;
    public residence_address_e: string;
    public residence_address: string;
    public passport_number: string;
    public tax_number: string;
    public social_security_number: string;
    public id_card_no: string;
    public date_of_issue: Date;
    public place_of_issue_e: string;
    public place_of_issue_l: string;
    public place_of_issue: string;
    public drivers_license: string;
    public ethnic_group_rcd: string;
    public religion_rcd: string;
    public marital_status_rcd: string;
    public primary_language_rcd: string;
    public description_e: string;
    public description_l: string;
    public description: string;
    public province_rcd: string;
    public district_rcd: string;
    public commune_rcd: string;
    public created_by_user_id: string;
    public created_date_time: Date;
    public lu_user_id: string;
    public lu_updated: Date;
    public relationship_type_rcd: string;
    public is_person_temporary: boolean;
    public is_employee: boolean;
    public objectJson_employee: Employee;
    public objectJson_user: User;
    public location: string;
    public location_e: string;
    public location_l: string;
    public location_code: string;
    public health_insurance_id: string;
    public allow_change_gender_flag: boolean;
    public status: number;
    public job_type_rcd: string;
    public avatar: string;
    public avatar_file_name: string;
    public contrary_type_rcd: string;
    public allow_sign_app: boolean;
    public default_flag: boolean; // relationship default_flag
    public clinical_specialty_name: string;

    constructor() {
        this.date_of_birth = null;
        this.date_of_issue = null;
    }

}
