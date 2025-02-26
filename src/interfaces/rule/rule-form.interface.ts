import { CategoryModel } from 'src/models';

export interface RuleFormInterface {
  title: string;
  question: string;
  content: string;
  is_extra_options: boolean;
  is_multi_select: boolean;
  category: CategoryModel;
  extra_question: string;
  extra_options?: { name: string }[];
}
