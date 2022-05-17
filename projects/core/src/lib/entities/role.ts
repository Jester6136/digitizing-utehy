export class Role {
    public role_id: string;
    public facility_id: string;
    public role_code: string;
    public role_name: string;
    public role_name_e: string;
    public role_name_l: string;
    public description: string;
    public description_e: string;
    public description_l: string;
    public use_context_security: boolean;
    public context_id: string;
    public user_number: number;
    public children: any[];
    public totalPages: number;
    public totalRecords: number;
    public page: number;
    public pageSize: number;
    public expanded: boolean;
    public loading: boolean;
}
