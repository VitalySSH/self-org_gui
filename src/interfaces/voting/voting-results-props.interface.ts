export interface VotingResultsProps {
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
  extraQuestion?: string;
  selectedOptions?: string[];
  minorityOptions?: string[];
}
