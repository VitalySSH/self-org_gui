import { VotingOptionModel } from 'src/models';
import { Resource } from 'src/shared/types.ts';

export interface UserVotingProps {
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
  question: string;
  extraQuestion: string;
  vote: boolean | undefined | null;
  isOptions: boolean;
  isDelegateVote: boolean;
  isMultiSelect: boolean;
  options: VotingOptionModel[];
  onVote: (vote: boolean) => void;
  onSelectChange: (fieldName: string, value: any) => void;
}
