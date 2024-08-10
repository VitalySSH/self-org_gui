export interface TableMemberRequest {
    key: string;
    member: string;
    status: string;
    reason: string;
    creator?: string;
    created?: string;
}