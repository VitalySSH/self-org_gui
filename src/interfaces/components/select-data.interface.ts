import { ApiModel } from "../../models";

export interface SelectDataInterface<T extends ApiModel> {
    options?: T[];
    currentValues?: T[];
}