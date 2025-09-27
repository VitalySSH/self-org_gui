import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany, manyToMany } from 'src/annotations';
import { CollectiveInteractionModel } from 'src/models/collective-interaction.model.ts';
import { CombinationSourceElementModel } from 'src/models/combination-source-element.model.ts';

@modelConfig({
  entityName: 'interaction_combination',
})
export class InteractionCombinationModel extends ApiModel {
  @attribute()
  new_idea_description!: string;

  @attribute()
  potential_impact!: string;

  @attribute()
  reasoning!: string;

  @oneToMany('collective_interaction')
  interaction?: CollectiveInteractionModel;

  @manyToMany('combination_source_element')
  source_elements?: CombinationSourceElementModel[];
}
