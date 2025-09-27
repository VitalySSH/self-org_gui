import { CategoryModel } from 'src/models';

export interface ChallengeFormInterface {
  title: string;
  description: string;
  category: CategoryModel;
  has_initial_solution: boolean;
  initial_solution?: string;
}