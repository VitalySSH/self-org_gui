import { ApiModel } from './api-model.model.ts';
import { attribute, modelConfig, oneToMany } from 'src/annotations';
import { UserModel } from 'src/models/user.model.ts';

@modelConfig({
  entityName: 'opinion',
})
export class OpinionModel extends ApiModel {
  @attribute()
  text?: string;

  @oneToMany('auth_user')
  creator?: UserModel;

  @attribute()
  initiative_id?: string;

  @attribute()
  rule_id?: string;
}
