export interface TableMemberRequest {
  key: string;
  member: string;
  status: string;
  reason: string;
  created: string;
  vote?: boolean | undefined;
  decision: string;
  isMyRequest?: boolean;
}
