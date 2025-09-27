import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany } from 'src/annotations';
import { CollectiveInteractionModel } from 'src/models/collective-interaction.model.ts';

@modelConfig({
  entityName: 'interaction_criticism',
})
export class InteractionCriticismModel extends ApiModel {
  @attribute()
  criticism_text!: string;

  @attribute()
  severity!: string;

  @attribute()
  suggested_fix!: string;

  @attribute()
  reasoning!: string;

  @oneToMany('collective_interaction')
  interaction?: CollectiveInteractionModel;
}
