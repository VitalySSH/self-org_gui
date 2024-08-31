import { CrudDataSourceService } from "../crud-data-source.service.ts";
import { CommunityModel } from "../../models";
import { Filters, Orders } from "../../types";
import { CrudApiDataInterface, Pagination } from "../../interfaces";
import { AOApiPath } from "../../shared/config.ts";


export class CommunityAOService
    extends CrudDataSourceService<CommunityModel>{

    constructor() {
        super(CommunityModel, AOApiPath);
    }

    async myList(
        filters?: Filters,
        orders?: Orders,
        pagination?: Pagination,
        include?: string[]
    ) {
        const url = `/${this.model.entityName}/my_list`;
        const data = {
            filters,
            orders,
            pagination,
            include,
        }

        const r =
            await this.http.post<CrudApiDataInterface[]>(url, data);
        const records: CommunityModel[] = [];
        r.data.forEach((item) => {
            const record = this.jsonApiToModel(item);
            records.push(record);
        });
        return records;
    }

}
