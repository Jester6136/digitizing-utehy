export class ItemGroup {
    public parent_item_group_id: string;
    public item_group_id: string;
    public item_group_name_e: string;
    public item_group_name: string;
    public item_group_name_l: string;
    public item_group_code: string;
    public icon_class: string;
    public file_image_url: any;    
    public image_url: string;
    public item_group_url: string;
    public key_struct: string;
    public group_type_rcd: string;
    public created_by_user_id: string;
    public created_date_time: Date;
    public lu_updated: Date;
    public lu_user_id: string;
    public active_flag: number;
    public sort_order: number;
    public count_childs: number;
    public children: ItemGroup[];
    public type: string;
    public label: string;
    public expanded: boolean;
}
