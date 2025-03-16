import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute } from 'src/annotations';

@modelConfig({
  entityName: 'auth_user',
})
export class UserModel extends ApiModel {
  @attribute(Date)
  firstname?: string;

  @attribute()
  surname?: string;

  @attribute()
  fullname?: string;

  @attribute()
  about_me?: string;

  @attribute()
  foto_id?: string | null;

  @attribute()
  email?: string;

  @attribute()
  is_active?: boolean;

  @attribute(Date)
  created?: Date;
}
