import { PageGroup } from './page-group';
import { Permission } from './permission';

export class Page {
    public page_id: string;
    public page_group_id: string;
    public page_name_l: string;
    public page_name_e: string;
    public page_name: string;
    public url: string;
    public page_seq_num: number;
    public sort_order: number;
    public public_flag: boolean;
    public description_e: string;
    public description: string;
    public description_l: string;
    public created_by_user_id: string;
    public lu_user_id: string;
    public active_flag: number;
    public api_url: string;
    public objectjson_page_group: PageGroup;
    public actions: Permission[];
    public active: boolean;
}
