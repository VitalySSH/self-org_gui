import { v4 } from 'uuid';
import {CrudApiDataInterface, Pagination} from "../interfaces";
import axios, { AxiosInstance } from "axios";
import {
    ApiModel,
    CommunityDescriptionModel,
    CommunityModel,
    CommunityNameModel,
    CommunitySettingsModel,
    DelegateSettingsModel, InitiativeCategoryModel,
    RequestMemberModel,
    StatusModel, UserCommunitySettingsModel,
    UserModel,
} from "../models";
import {Filters, ModelType, Orders} from "../types";
import AuthApiClientService from "./auth-api-client.service.ts";
import { CurrentUserService } from "./current-user.service.ts";
import { dataSourceConfig } from "../annotations";

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
export class CrudDataSourceService<T extends ApiModel> {

    modelType: ModelType<T>;
    model: T;
    http: AxiosInstance;

    constructor(modelType: ModelType<T>) {
        this.http = axios.create({
            baseURL: 'http://localhost:8080/api/v1/crud',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        this.modelType = modelType;
        this.model = new this.modelType();
        this.refreshToken();
    }

    private getModel(entityName: string): ModelType<any> {
        const config = Reflect.getMetadata('DataSourceConfig', this.constructor);
        return config.models[entityName];
    }

    private refreshToken() {
        this.http.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const originalConfig = error.config;
                const userData = CurrentUserService.user;

                if (userData && error.response?.status === 401 && !originalConfig._retry) {
                    originalConfig._retry = true;
                    await AuthApiClientService.asyncLogin(userData.email, userData.hashed_password);

                    return this.http(originalConfig);
                }

                return Promise.reject(error);
            }
        );
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

        for (const [key, value] of Object.entries(apiData.attributes || {})) {
            if (attributes[key]) {
                model[key] = value;
            }
        }
        for (const [key, value] of Object.entries(apiData.readonly || {})) {
            if (readonly[key]) {
                model[key] = value;
            }
        }
        for (const [key, value] of Object.entries(apiData.relations || {})) {
            const oneToManyEntityName = oneToMany[key]?.entityName;
            if (oneToManyEntityName) {
                if (Object.keys(value || {}).length) {
                    const oneToManyModel = this.getModel(oneToManyEntityName);
                    model[key] = this.jsonApiToModel(value, new oneToManyModel());
                }
            } else {
                const manyToManyEntityName = manyToMany[key]?.entityName;
                if (manyToManyEntityName) {
                    const relations: T[] = [];
                    if (value.length) {
                        value.forEach((relation: CrudApiDataInterface) => {
                            const manyToManyModel = this.getModel(manyToManyEntityName);
                            const relationModel = this.jsonApiToModel(relation, new manyToManyModel());
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


    get(id: string, include?: string[]) {
        const url = this.buildUrlWithInclude(
            `/${this.model.entityName}/${id}`, include)
        return this.http.get<CrudApiDataInterface>(url)
            .then(r => {
                return this.jsonApiToModel(r.data)
            });
    }

    async asyncGet(id: string, include?: string[]) {
        const url = this.buildUrlWithInclude(
            `/${this.model.entityName}/${id}`, include)
        const response =
            await this.http.get<CrudApiDataInterface>(url);

        return this.jsonApiToModel(response.data);
    }

    list(filters?: Filters, orders?: Orders, pagination?: Pagination, include?: string[]) {
        const url = `/${this.model.entityName}/list`;
        const data = {
            filters,
            orders,
            pagination,
            include,
        }

        return this.http.post<CrudApiDataInterface[]>(url, data)
            .then(r => {
                const records: T[] = [];
                r.data.forEach((item) => {
                    const record = this.jsonApiToModel(item);
                    records.push(record);
                });
                return records;
            });
    }

    save(model: T, create: boolean = false) {
        const data = this.modelToJsonApi(model);

        if (!create && model.id) {
            const url = `/${this.model.entityName}/${model.id}`;
            return this.http.patch<CrudApiDataInterface>(url, data);
        } else {
            const url = `/${this.model.entityName}`;
            return this.http.post<CrudApiDataInterface>(url, data);
        }


    }


}
