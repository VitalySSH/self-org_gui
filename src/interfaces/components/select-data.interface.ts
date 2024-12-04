import { ApiModel } from "src/models";

export interface SelectDataInterface<T extends ApiModel> {
    options?: T[];
    currentValues?: T[];
}