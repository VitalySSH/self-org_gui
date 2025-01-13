export interface CommunityNameDataInterface {
    name: string;
    parent_data: { id: string, name: string }[];
    is_blocked: boolean;
}