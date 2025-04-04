import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany } from 'src/annotations';
import { UserModel } from './user.model.ts';
import { StatusModel } from './status.model.ts';
import { CommunityModel } from './community.model.ts';

@modelConfig({
  entityName: 'request_member',
})
export class RequestMemberModel extends ApiModel {
  @oneToMany('auth_user')
  member?: UserModel;

  @oneToMany('community')
  community?: CommunityModel;

  @oneToMany('status')
  status?: StatusModel;

  @attribute()
  vote?: boolean | null;

  @attribute()
  reason?: string;

  @attribute()
  parent_id?: string;

  @attribute()
  creator_id?: string;

  @attribute(Date)
  created?: Date;

  @attribute(Date)
  updated?: Date;
}
