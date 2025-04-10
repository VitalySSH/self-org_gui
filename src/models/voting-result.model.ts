import { ApiModel } from './api-model.model.ts';
import { attribute, modelConfig } from 'src/annotations';
import { ResponsibilityDataI, VotingOptionData } from 'src/interfaces';

@modelConfig({
  entityName: 'voting_result',
})
export class VotingResultModel extends ApiModel {
  @attribute()
  vote?: boolean;

  @attribute()
  is_significant_minority?: boolean;

  @attribute()
  options?: { [key: string]: VotingOptionData };

  @attribute()
  minority_options?: { [key: string]: VotingOptionData };

  @attribute()
  noncompliance?: { [key: string]: ResponsibilityDataI };
}
