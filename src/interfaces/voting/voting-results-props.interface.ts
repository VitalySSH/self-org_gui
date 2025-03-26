import { Resource } from 'src/shared/types.ts';

export interface VotingResultsProps {
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
  extraQuestion?: string;
  selectedOptions?: string[];
  minorityOptions?: string[];
}
