import { Resource } from 'src/shared/types.ts';
import { ResponsibilityData, VotingOptionData } from 'src/interfaces';

export interface VotingResultsProps {
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
  extraQuestion?: string;
  selectedOptions?: VotingOptionData | {};
  minorityOptions?: VotingOptionData | {};
  noncompliance?: ResponsibilityData | {};
  minorityNoncompliance?: ResponsibilityData | {};
}
