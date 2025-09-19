import { RequestMemberModel, StatusModel } from 'src/models';
import { Dayjs } from 'dayjs';

export interface MemberRequestFilterValues {
  status?: StatusModel;
  requestMember?: RequestMemberModel;
  decision?: boolean;
  created?: Dayjs[];
}
