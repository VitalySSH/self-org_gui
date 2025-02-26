import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute } from 'src/annotations';

@modelConfig({
  entityName: 'user',
})
export class UserModel extends ApiModel {
  @attribute()
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

  @attribute()
  created?: Date;
}
