import { v4 } from 'uuid';
import {
  CrudApiDataInterface,
  CrudApiListResponse,
  ListResponse,
  Pagination,
} from 'src/interfaces';
import {
  ApiModel,
  CommunityDescriptionModel,
  CommunityModel,
  CommunityNameModel,
  CommunitySettingsModel,
  DelegateSettingsModel,
  CategoryModel,
  RequestMemberModel,
  StatusModel,
  UserCommunitySettingsModel,
  UserModel,
  VotingResultModel,
  UserVotingResultModel,
  VotingOptionModel,
} from 'src/models';
import { Filters, ModelType, Orders } from 'src/shared/types';
import { dataSourceConfig } from 'src/annotations';
import { DataSourceService } from './data-source.service.ts';
import { baseApiUrl } from 'src/config/configuration';

@dataSourceConfig({
  models: {
    user: UserModel,
    category: CategoryModel,
    status: StatusModel,
    community: CommunityModel,
    request_member: RequestMemberModel,
    community_description: CommunityDescriptionModel,
    community_name: CommunityNameModel,
    community_settings: CommunitySettingsModel,
    delegate_settings: DelegateSettingsModel,
    user_community_settings: UserCommunitySettingsModel,
    voting_result: VotingResultModel,
    voting_option: VotingOptionModel,
    user_voting_result: UserVotingResultModel,
  },
})
export class CrudDataSourceService<
  T extends ApiModel,
> extends DataSourceService {
  modelType: ModelType<T>;
  model: T;

  constructor(modelType: ModelType<T>, baseURL = `${baseApiUrl}/crud`) {
    super(baseURL);
    this.modelType = modelType;
    this.model = new this.modelType();
    if (this.model instanceof UserModel) {
      throw new Error(
        'Модель пользователя User не предназначена для операций CRUD'
      );
    }
  }

  private getModel(entityName: string): ModelType<any> {
    const config = Reflect.getMetadata('DataSourceConfig', this.constructor);
    return config.models[entityName];
  }

  createRecord() {
    return new this.modelType();
  }

  jsonApiToModel(apiData: CrudApiDataInterface, model: any = undefined): T {
    if (!model) model = new this.modelType();
    model.id = apiData.id;
    const attributes = model.attributes;
    const oneToMany = model.oneToMany;
    const manyToMany = model.manyToMany;

    const attributesData = apiData.attributes || {};
    for (const [key, value] of Object.entries(attributesData)) {
      if (attributes[key]) {
        model[key] = value;
      }
    }
    const relationsData = apiData.relations || {};
    for (const [key, value] of Object.entries(relationsData)) {
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
              const relationModel = this.jsonApiToModel(
                relation,
                new manyToManyModel()
              );
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
      id: model.id || v4(),
    };
    const attributes: { [key: string]: any } = {};
    const relations: { [key: string]: any } = {};

    Object.keys(model.attributes).forEach((attr) => {
      if (model[attr] !== undefined) {
        attributes[attr] = model[attr];
      }
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
      const param = `include=${inc}`;
      included.push(param);
    });

    return included.length ? url + '?' + included.join('&') : url;
  }

  async get(id: string, include?: string[]) {
    const url = this.buildUrlWithInclude(
      `/${this.model.entityName}/${id}`,
      include
    );
    const r = await this.http.get<CrudApiDataInterface>(url);

    return this.jsonApiToModel(r.data);
  }

  async list(
    filters?: Filters,
    orders?: Orders,
    pagination?: Pagination,
    include?: string[]
  ): Promise<ListResponse<T>> {
    const url = `/${this.model.entityName}/list`;
    const data = {
      filters,
      orders,
      pagination,
      include,
    };

    const r = await this.http.post<CrudApiListResponse>(url, data);
    const records: T[] = [];
    r.data.items.forEach((item) => {
      const record = this.jsonApiToModel(item);
      records.push(record);
    });

    return { data: records, total: r.data.total };
  }

  async save(model: T, create: boolean = false) {
    const data = this.modelToJsonApi(model);

    if (!create && model.id) {
      const url = `/${this.model.entityName}/${model.id}`;
      const r = await this.http.patch<CrudApiDataInterface>(url, data);

      return this.jsonApiToModel(r.data);
    } else {
      const url = `/${this.model.entityName}`;
      const r = await this.http.post<CrudApiDataInterface>(url, data);

      return this.jsonApiToModel(r.data);
    }
  }

  async delete(id: string) {
    const url = `/${this.model.entityName}/${id}`;
    await this.http.delete<void>(url);
  }
}
