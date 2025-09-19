import { Resource } from 'src/shared/types.ts';

export interface FilterModalProps {
  communityId: string;
  visible: boolean;
  onCancel: () => void;
  onApply: (values: any) => void;
  onReset: () => void;
  resource?: Resource;
  currentUserId?: string;
  withoutCurrentUser?: boolean;
}
