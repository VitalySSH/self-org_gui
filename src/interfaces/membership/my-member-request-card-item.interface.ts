export interface MyMemberRequestCardItem {
  key: string;
  communityName: string;
  communityDescription: string;
  communityId: string;
  status: string;
  statusCode: string;
  reason: string;
  created: string;
  children?: MyMemberRequestCardItem[];
}
