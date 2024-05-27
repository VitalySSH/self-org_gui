import { FilterOperations } from "../../types";

type FilterValueType = string | number | boolean | Array<any>;


export interface FilterItem {
    field?: string;
    operation?: FilterOperations;
    value?: FilterValueType;
}