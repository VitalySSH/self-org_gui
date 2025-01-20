import { CrudApiDataInterface } from "src/interfaces";

export interface CrudApiListResponse {
    items: CrudApiDataInterface[];
    total: number;
}