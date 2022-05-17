import { Page } from './page';

export class PageGroup {
    public page_group_id: string;
    public page_group_name: string;
    public page_group_name_e: string;
    public page_group_name_l: string;
    public css_class: string;
    public description: string;
    public description_e: string;
    public description_l: string;
    public ord: number;
    public sort_order: number;
    public is_public: boolean;
    public pages: Page[];
    public active: boolean;
    public is_open: boolean;
}
