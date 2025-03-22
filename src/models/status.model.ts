import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute } from 'src/annotations';

@modelConfig({
  entityName: 'status',
})
export class StatusModel extends ApiModel {
  @attribute()
  code?: string;

  @attribute()
  name?: string;
}
