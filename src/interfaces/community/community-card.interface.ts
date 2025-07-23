export interface CommunityCardInterface {
  id: string;
  title: string;
  description: string;
  members: number;
  isMyCommunity?: boolean;
  isAddRequest?: boolean;
  isBlocked?: boolean;
}
