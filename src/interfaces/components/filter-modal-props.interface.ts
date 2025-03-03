import { FilterValues } from 'src/interfaces';
import { Resource } from 'src/shared/types.ts';

export interface FilterModalProps {
  communityId: string;
  visible: boolean;
  onCancel: () => void;
  onApply: (values: FilterValues) => void;
  onReset: () => void;
  resource: Resource;
}
