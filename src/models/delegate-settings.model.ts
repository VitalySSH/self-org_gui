import { ApiModel } from './api-model.model.ts';
import { modelConfig, oneToMany, attribute } from 'src/annotations';
import { UserModel } from './user.model.ts';
import { CategoryModel } from './category.model.ts';

@modelConfig({
  entityName: 'delegate_settings',
})
export class DelegateSettingsModel extends ApiModel {
  @oneToMany('category')
  category?: CategoryModel;

  @attribute()
  user_id?: string;

  @attribute()
  community_id?: string;

  @oneToMany('auth_user')
  delegate?: UserModel;
}
