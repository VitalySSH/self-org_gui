import { StatusModel, UserModel } from 'src/models';
import { Dayjs } from 'dayjs';

export interface MemberRequestFilterValues {
  status?: StatusModel;
  member?: UserModel;
  decision?: boolean;
  created?: Dayjs[];
}
