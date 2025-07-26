import { CrudDataSourceService } from 'src/services';
import { ApiModel } from 'src/models';
import { ListResponse, Pagination } from 'src/interfaces';
import { Filters } from 'src/shared/types.ts';

export interface SelectInterface<T extends ApiModel> {
  fieldService?: CrudDataSourceService<any>;
  requestOptions: (
    pagination?: Pagination,
    filters?: Filters
  ) => Promise<ListResponse<T>>;
  onChange: (fieldName: string, value: any) => void;
  value?: T | T[];
  formField: string;
  bindLabel: string;
  readonly?: boolean;
  multiple?: boolean;
  enableSearch?: boolean;
  label?: string;
  addOwnValue?: boolean;
  saveOwnValue?: boolean;
  ownValuePlaceholder?: string;
  ownFieldTextarea?: boolean;
  ownValueMaxLength?: number;
}
