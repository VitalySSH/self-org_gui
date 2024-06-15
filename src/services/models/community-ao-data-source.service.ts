import { CrudDataSourceService } from "../crud-data-source.service.ts";
import { CommunityModel } from "../../models";
import { Filters, ModelType, Orders } from "../../types";
import { CrudApiDataInterface, Pagination } from "../../interfaces";


export class CommunityAoDataSourceService
    extends CrudDataSourceService<CommunityModel>{

    constructor(modelType: ModelType<CommunityModel>) {
        super(modelType, 'http://localhost:8080/api/v1/ao');
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
