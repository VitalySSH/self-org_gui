import { FilterValues } from 'src/interfaces';

export interface CommunityFilterModalProps {
  visible: boolean;
  onCancel: () => void;
  onApply: (values: FilterValues) => void;
  onReset: () => void;
}
