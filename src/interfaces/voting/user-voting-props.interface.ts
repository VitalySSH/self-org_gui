import { VotingOptionModel } from 'src/models';
import { Resource } from 'src/shared/types.ts';

export interface UserVotingProps {
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
  extraQuestion: string;
  vote: boolean | undefined;
  isOptions: boolean;
  isMultiSelect: boolean;
  options: VotingOptionModel[];
  onVote: (vote: boolean) => void;
  onSelectChange: (fieldName: string, value: any) => void;
}
