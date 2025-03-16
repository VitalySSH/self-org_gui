import { CategoryModel } from 'src/models';

export interface InitiativeFormInterface {
  title: string;
  question: string;
  content: string;
  is_one_day_event: boolean;
  event_date: Date | null;
  is_extra_options: boolean;
  is_multi_select: boolean;
  category: CategoryModel;
  extra_question: string;
  extra_options?: { name: string }[];
}
