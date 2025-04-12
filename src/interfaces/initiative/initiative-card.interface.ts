export interface InitiativeCardInterface {
  id: string;
  title?: string;
  description?: string;
  tracker?: string;
  creator?: string;
  status?: string;
  statusCode?: string;
  category?: string;
  isOneDayEvent: boolean;
  eventDate?: string;
}
