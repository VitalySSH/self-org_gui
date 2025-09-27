import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany } from 'src/annotations';
import { InteractionCombinationModel } from 'src/models/interaction-combination.model.ts';
import { SolutionModel } from 'src/models/solution.model.ts';

@modelConfig({
  entityName: 'combination_source_element',
})
export class CombinationSourceElementModel extends ApiModel {
  @attribute()
  element_description!: string;

  @attribute()
  element_context!: string;

  @attribute()
  reasoning!: string;

  @oneToMany('interaction_combination')
  combination?: InteractionCombinationModel;

  @oneToMany('solution')
  source_solution?: SolutionModel;
}
