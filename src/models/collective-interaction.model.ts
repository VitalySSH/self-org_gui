import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany, manyToMany } from 'src/annotations';
import { SolutionModel } from 'src/models/solution.model.ts';
import { InteractionSuggestionModel } from 'src/models/interaction-suggestion.model.ts';
import { InteractionCriticismModel } from 'src/models/interaction-criticism.model.ts';
import { InteractionCombinationModel } from 'src/models/interaction-combination.model.ts';
import { VersionInteractionInfluenceModel } from 'src/models/version-interaction-influence.model.ts';

@modelConfig({
  entityName: 'collective_interaction',
})
export class CollectiveInteractionModel extends ApiModel {
  @attribute()
  interaction_type!: string;

  @attribute()
  user_response!: string;

  @attribute()
  user_reasoning?: string;

  @attribute()
  applied_to_solution!: boolean;

  @attribute(Date)
  created_at!: Date;

  @attribute(Date)
  responded_at?: Date;

  @oneToMany('solution')
  solution?: SolutionModel;

  @manyToMany('interaction_suggestion')
  suggestions?: InteractionSuggestionModel[];

  @manyToMany('interaction_criticism')
  criticisms?: InteractionCriticismModel[];

  @manyToMany('interaction_combination')
  combinations?: InteractionCombinationModel[];

  @manyToMany('version_interaction_influence')
  influences?: VersionInteractionInfluenceModel[];
}
