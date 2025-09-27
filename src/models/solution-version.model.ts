import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany, manyToMany } from 'src/annotations';
import { SolutionModel } from 'src/models/solution.model.ts';
import { VersionInteractionInfluenceModel } from 'src/models/version-interaction-influence.model.ts';

@modelConfig({
  entityName: 'solution_version',
})
export class SolutionVersionModel extends ApiModel {
  @attribute()
  content!: string;

  @attribute()
  change_description!: string;

  @attribute()
  version_number!: number;

  @attribute(Date)
  created_at?: Date;

  @oneToMany('solution')
  solution?: SolutionModel;

  @manyToMany('version_interaction_influence')
  influences?: VersionInteractionInfluenceModel[];
}
