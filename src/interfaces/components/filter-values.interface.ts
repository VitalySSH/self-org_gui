import { CategoryModel, StatusModel, UserModel } from 'src/models';
import { Dayjs } from 'dayjs';

export interface FilterValues {
  title?: string;
  content?: string;
  description?: string;
  status?: StatusModel;
  creator?: UserModel;
  category?: CategoryModel;
  isOneDayEvent?: boolean;
  eventDate?: Dayjs;
}
