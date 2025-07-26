import { NoncomplianceModel, VotingOptionModel } from 'src/models';
import { Resource } from 'src/shared/types.ts';

export interface UserVotingProps {
  communityId: string;
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
  question: string;
  extraQuestion: string;
  vote: boolean | undefined | null;
  isOptions: boolean;
  isDelegateVote: boolean;
  isVoteByDefault: boolean;
  readonly: boolean;
  options: VotingOptionModel[];
  noncompliance?: NoncomplianceModel[];
  onVote: (vote: boolean) => void;
  onSelectChange: (fieldName: string, value: any) => void;
}
