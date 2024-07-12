import { v4 } from 'uuid';
import { CrudApiDataInterface, Pagination } from "../interfaces";
import {
    ApiModel,
    CommunityDescriptionModel,
    CommunityModel,
    CommunityNameModel,
    CommunitySettingsModel,
    DelegateSettingsModel,
    InitiativeCategoryModel,
    RequestMemberModel,
    StatusModel,
    UserCommunitySettingsModel,
    UserModel,
} from "../models";
import { Filters, ModelType, Orders } from "../types";
import { dataSourceConfig } from "../annotations";
import { DataSourceService } from "./data-source.service.ts";

@dataSourceConfig({
    models: {
        user: UserModel,
        request_member: RequestMemberModel,
        status: StatusModel,
        community: CommunityModel,
        community_description: CommunityDescriptionModel,
        community_name: CommunityNameModel,
        community_settings: CommunitySettingsModel,
        delegate_settings: DelegateSettingsModel,
        initiative_category: InitiativeCategoryModel,
        user_community_settings: UserCommunitySettingsModel,
    }
})
export class CrudDataSourceService<T extends ApiModel>
    extends DataSourceService{

    modelType: ModelType<T>;
    model: T;

    constructor(
        modelType: ModelType<T>,
        baseURL = 'http://localhost:8080/api/v1/crud',
    ) {
        super(baseURL);
        this.modelType = modelType;
        this.model = new this.modelType();
    }

    private getModel(entityName: string): ModelType<any> {
        const config = Reflect.getMetadata(
            'DataSourceConfig', this.constructor);
        return config.models[entityName];
    }

    createRecord() {
        return new this.modelType();
    }

    jsonApiToModel(apiData: CrudApiDataInterface, model: any = undefined): T {
        if (!model) model = new this.modelType();
        model.id = apiData.id;
        const attributes = model.attributes;
        const readonly = model.readonly;
        const oneToMany = model.oneToMany;
        const manyToMany = model.manyToMany;

        const attributesData = apiData.attributes || {};
        for (const [key, value] of Object.entries(attributesData)) {
            if (attributes[key]) {
                model[key] = value;
            }
        }
        const readonlyData = apiData.readonly || {};
        for (const [key, value] of Object.entries(readonlyData)) {
            if (readonly[key]) {
                model[key] = value;
            }
        }
        const relationsData = apiData.relations || {};
        for (const [key, value] of Object.entries(relationsData)) {
            const oneToManyEntityName = oneToMany[key]?.entityName;
            if (oneToManyEntityName) {
                if (Object.keys(value || {}).length) {
                    const oneToManyModel =
                        this.getModel(oneToManyEntityName);
                    model[key] =
                        this.jsonApiToModel(value, new oneToManyModel());
                }
            } else {
                const manyToManyEntityName = manyToMany[key]?.entityName;
                if (manyToManyEntityName) {
                    const relations: T[] = [];
                    if (value.length) {
                        value.forEach(
                            (relation: CrudApiDataInterface) => {
                            const manyToManyModel =
                                this.getModel(manyToManyEntityName);
                            const relationModel =
                                this.jsonApiToModel(relation,
                                    new manyToManyModel());
                            relations.push(relationModel);
                        });
                    }
                    model[key] = relations;
                }
            }
        }

        return model as T;
    }

    modelToJsonApi(model: T): CrudApiDataInterface {
        const jsonApi: { [key: string]: any } = {
            id: model.id || v4()
        };
        const attributes: { [key: string]: any } = {};
        const relations: { [key: string]: any } = {};

        Object.keys(model.attributes).forEach((attr) => {
            attributes[attr] = model[attr];
        });
        Object.keys(model.oneToMany).forEach((attr) => {
            if (model[attr]) {
                relations[attr] = this.modelToJsonApi(model[attr]);
            } else relations[attr] = {};
        });
        Object.keys(model.manyToMany).forEach((attr) => {
            if (Array.isArray(model[attr])) {
                const manyToMany: CrudApiDataInterface[] = [];
                model[attr].forEach((relation: T) => {
                    manyToMany.push(this.modelToJsonApi(relation));
                });
                relations[attr] = manyToMany;
            }
        });

        jsonApi['attributes'] = attributes;
        jsonApi['relations'] = relations;

        return jsonApi as CrudApiDataInterface;
    }

    private buildUrlWithInclude(url: string, include?: string[]) {
        const included: string[] = [];
        (include || []).forEach((inc) => {
            const param = `include=${inc}`
            included.push(param);
        });

        return included.length ? url + '?' + included.join('&') : url;
    }


    async get(id: string, include?: string[]) {
        const url = this.buildUrlWithInclude(
            `/${this.model.entityName}/${id}`, include)
        const r =
            await this.http.get<CrudApiDataInterface>(url);

        return this.jsonApiToModel(r.data);
    }

    async list(
        filters?: Filters,
        orders?: Orders,
        pagination?: Pagination,
        include?: string[]
    ) {
        const url = `/${this.model.entityName}/list`;
        const data = {
            filters,
            orders,
            pagination,
            include,
        }

        const r =
            await this.http.post<CrudApiDataInterface[]>(url, data);
        const records: T[] = [];
        r.data.forEach((item) => {
            const record = this.jsonApiToModel(item);
            records.push(record);
        });

        return records;
    }

    async save(model: T, create: boolean = false) {
        const data = this.modelToJsonApi(model);

        if (!create && model.id) {
            const url = `/${this.model.entityName}/${model.id}`;
            const r =
                await this.http.patch<CrudApiDataInterface>(url, data);

            return this.jsonApiToModel(r.data);
        } else {
            const url = `/${this.model.entityName}`;
            const r =
                await this.http.post<CrudApiDataInterface>(url, data);

            return this.jsonApiToModel(r.data);
        }
    }


}
