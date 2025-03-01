import { StatusModel, UserModel } from 'src/models';

export interface FilterValues {
    title?: string;
    content?: string;
    status?: StatusModel;
    creator?: UserModel;
}