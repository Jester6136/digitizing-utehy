
export class Facility {
    public facility_id: string;
    public facility_code: string;
    public facility_name_e: string;
    public facility_name: string;
    public facility_name_l: string;
    public effective_from_date: any;
    public effective_until_date: any;
    public email: string;
    public phone_number: string;
    public fax_number: string;
    public hotline: string;
    public emergency: string;
    public address_e: string;
    public address: string;
    public address_l: string;
    public hostname_or_ip: string;
    public image_url: string;
    public description_e: string;
    public description: string;
    public description_l: string;
    public level: number;
    public ord: number;
    public active_flag: number;
    public created_date_time: Date;
    public created_by_user_id: string;
    public lu_user_id: string;
    public lu_updated: Date;

    public constructor() {
        this.effective_from_date = null;
        this.effective_until_date = null;
    }
}
