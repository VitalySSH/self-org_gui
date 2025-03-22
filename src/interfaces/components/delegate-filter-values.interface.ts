import { CategoryModel, UserModel } from 'src/models';

export interface DelegateFilterValues {
  category?: CategoryModel;
  delegate?: UserModel;
}
