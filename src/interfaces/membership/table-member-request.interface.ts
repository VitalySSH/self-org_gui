export interface TableMemberRequest {
    key: string;
    member: string;
    status: string;
    reason: string;
    created?: Date;
}