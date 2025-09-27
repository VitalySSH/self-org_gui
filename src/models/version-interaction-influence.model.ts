import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany } from 'src/annotations';
import { SolutionVersionModel } from 'src/models/solution-version.model.ts';
import { CollectiveInteractionModel } from 'src/models/collective-interaction.model.ts';

@modelConfig({
  entityName: 'version_interaction_influence',
})
export class VersionInteractionInfluenceModel extends ApiModel {
  @attribute()
  influence_type!: string;

  @attribute()
  description!: string;

  @oneToMany('solution_version')
  solution_version?: SolutionVersionModel;

  @oneToMany('collective_interaction')
  collective_interaction?: CollectiveInteractionModel;
}
