import { ApiModel } from './api-model.model.ts';
import { attribute, manyToMany, modelConfig, oneToMany } from 'src/annotations';
import { VotingOptionModel } from './voting-option.model.ts';
import { VotingResultModel } from 'src/models/voting-result.model.ts';
import { NoncomplianceModel } from 'src/models/noncompliance.model.ts';

@modelConfig({
  entityName: 'user_voting_result',
})
export class UserVotingResultModel extends ApiModel {
  @attribute()
  vote?: boolean;

  @attribute()
  is_voted_myself?: boolean;

  @attribute()
  member_id?: string;

  @attribute()
  community_id!: string;

  @attribute()
  initiative_id?: string;

  @attribute()
  rule_id?: string;

  @attribute()
  is_blocked?: boolean;

  @manyToMany('voting_option')
  extra_options?: VotingOptionModel[];

  @manyToMany('noncompliance')
  noncompliance?: NoncomplianceModel[];

  @oneToMany('voting_result')
  voting_result?: VotingResultModel;
}
