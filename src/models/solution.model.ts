import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany, manyToMany } from 'src/annotations';
import { ChallengeModel } from 'src/models/challenge.model.ts';
import { SolutionVersionModel } from 'src/models/solution-version.model.ts';
import { CollectiveInteractionModel } from 'src/models/collective-interaction.model.ts';
import { UserModel } from 'src/models/user.model.ts';

@modelConfig({
  entityName: 'solution',
})
export class SolutionModel extends ApiModel {
  @attribute()
  current_content!: string;

  @attribute()
  collective_influence_count!: number;

  @attribute(Date)
  created_at?: Date;

  @attribute(Date)
  updated_at?: Date;

  @attribute()
  status!: string;

  @oneToMany('auth_user')
  user!: UserModel;

  @oneToMany('challenge')
  challenge!: ChallengeModel;

  @manyToMany('solution_version', true)
  versions?: SolutionVersionModel[];

  @manyToMany('collective_interaction')
  interactions?: CollectiveInteractionModel[];
}
