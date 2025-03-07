export interface TableMyMemberRequest {
  key: string;
  communityName: string;
  communityDescription: string;
  communityId: string;
  status: string;
  statusCode: string;
  reason: string;
  created: string;
  solution: string;
  children?: TableMyMemberRequest[];
}
