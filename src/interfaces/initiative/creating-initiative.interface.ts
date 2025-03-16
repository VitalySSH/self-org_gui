export interface CreatingInitiativeInterface {
  title: string;
  question: string;
  content: string;
  is_one_day_event: boolean;
  event_date: string | null;
  is_extra_options: boolean;
  is_multi_select: boolean;
  community_id: string;
  extra_question: string;
  category_id: string;
  extra_options: string[];
}
