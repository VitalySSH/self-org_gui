import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute } from 'src/annotations';

@modelConfig({
  entityName: 'noncompliance',
})
export class NoncomplianceModel extends ApiModel {
  @attribute()
  name!: string;

  @attribute()
  community_id?: string;

  @attribute()
  creator_id?: string;
}
