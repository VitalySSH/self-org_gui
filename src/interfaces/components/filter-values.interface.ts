import { StatusModel, UserModel } from 'src/models';
import { Dayjs } from 'dayjs';

export interface FilterValues {
  title?: string;
  content?: string;
  status?: StatusModel;
  creator?: UserModel;
  isOneDayEvent?: boolean;
  eventDate?: Dayjs;
}
