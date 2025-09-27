import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany } from 'src/annotations';
import { CollectiveInteractionModel } from 'src/models/collective-interaction.model.ts';

@modelConfig({
  entityName: 'interaction_suggestion',
})
export class InteractionSuggestionModel extends ApiModel {
  @attribute()
  element_description!: string;

  @attribute()
  integration_advice!: string;

  @attribute()
  source_solutions_count!: number;

  @attribute()
  reasoning!: string;

  @oneToMany('collective_interaction')
  interaction?: CollectiveInteractionModel;
}
