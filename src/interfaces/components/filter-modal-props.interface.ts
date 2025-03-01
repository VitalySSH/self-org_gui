import { FilterValues } from 'src/interfaces';
import { Resource } from 'src/shared/types.ts';

export interface FilterModalProps {
    visible: boolean;
    onCancel: () => void;
    onApply: (values: FilterValues) => void;
    onReset: () => void;
    resource: Resource;
}