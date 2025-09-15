import type { StatusGroupType, StatusItemType } from "@/types/common";

export type Page = {
    id?: number;
    name: string;
    slug: string;
    report: string;
    api?: string;
    secret?: string;
    created_at?: string;
    updated_at?: string;
    groups?: StatusGroupType[];
}

export type PageGroup = {
    name: string;
    alias: string;
    list: StatusItemType[];
}