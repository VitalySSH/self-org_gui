import { CategoryModel, UserModel } from 'src/models';

export interface DelegateFormInterface {
  category: CategoryModel;
  delegate: UserModel;
}
