import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany } from 'src/annotations';
import { StatusModel } from './status.model.ts';

@modelConfig({
  entityName: 'category',
})
export class CategoryModel extends ApiModel {
  @attribute()
  name!: string;

  @attribute()
  community_id?: string;

  @attribute()
  creator_id!: string;

  @oneToMany('status')
  status?: StatusModel;
}
