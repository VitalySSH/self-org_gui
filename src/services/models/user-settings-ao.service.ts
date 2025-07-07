import { CrudDataSourceService } from 'src/services';
import {
  CommunityDescriptionModel,
  CommunityNameModel,
  CategoryModel,
  StatusModel,
  UserCommunitySettingsModel,
  UserModel,
  ResponsibilityModel,
} from 'src/models';
import { AOApiUrl } from 'src/config/configuration';
import {
  CommunitySettingsInterface,
  CreatingCommunitySettings,
  CrudApiDataInterface,
} from 'src/interfaces';
import { OnConsiderationCode } from 'src/consts';

export class UserSettingsAoService extends CrudDataSourceService<UserCommunitySettingsModel> {
  constructor() {
    super(UserCommunitySettingsModel, AOApiUrl);
  }

  async createCommunity(settings: CreatingCommunitySettings) {
    const url = `/${this.model.entityName}/create_community`;

    return this.http.post<void>(url, settings);
  }

  async createChildSettings(settings: CreatingCommunitySettings) {
    const url = `/${this.model.entityName}/create_child_settings`;

    return this.http
      .post<CrudApiDataInterface>(url, settings)
      .then((r) => this.jsonApiToModel(r.data));
  }

  async saveSettingsOnForm(
    settings: UserCommunitySettingsModel,
    formData: CommunitySettingsInterface,
    communityId: string,
    user: UserModel,
    isSubSettings: boolean = false
  ) {
    if (isSubSettings && settings.id) {
      return Promise.resolve(settings);
    }
    const settingsService = new CrudDataSourceService(
      UserCommunitySettingsModel
    );
    const names = await Promise.all(
      formData.names.map((name) =>
        this._getOrCreateName(name, communityId, user.id)
      )
    );
    const descriptions = await Promise.all(
      formData.descriptions.map((description) =>
        this._getOrCreateDescription(description, communityId, user.id)
      )
    );
    const categories = await this._getOrCreateCategories(
      formData.categories || [],
      communityId,
      user.id
    );
    const subSettings: UserCommunitySettingsModel[] = [];
    for (const subSettingsData of formData.sub_communities_settings || []) {
      const _subSettings = await this._getOrCreateSubSettings(
        subSettingsData,
        communityId
      );
      subSettings.push(_subSettings);
    }
    const responsibilities = await Promise.all(
      (formData.responsibilities || []).map((responsibility) =>
        this._getOrCreateResponsibility(responsibility, communityId, user.id)
      )
    );
    settings.sub_communities_settings = subSettings;
    settings.names = names;
    settings.descriptions = descriptions;
    settings.categories = categories as CategoryModel[];
    settings.responsibilities = responsibilities;
    settings.vote = formData.vote;
    settings.quorum = formData.quorum;
    settings.significant_minority = formData.significant_minority;
    settings.decision_delay = formData.decision_delay;
    settings.dispute_time_limit = formData.dispute_time_limit;
    settings.is_workgroup = formData.is_workgroup;
    settings.workgroup = formData.workgroup;
    settings.is_secret_ballot = formData.is_secret_ballot;
    settings.is_can_offer = formData.is_can_offer;
    settings.is_minority_not_participate = formData.is_minority_not_participate;
    settings.is_default_add_member = formData.is_default_add_member;
    settings.is_not_delegate = formData.is_not_delegate;

    return settingsService.save(settings);
  }

  private settingsToFormData(
    settings: UserCommunitySettingsModel,
    parent_community_id?: string
  ): CreatingCommunitySettings {
    const formData = {
      names: settings.names?.map((n) => n.name),
      descriptions: settings.descriptions?.map((d) => d.value),
      categories: (settings.categories || []).map((it) => {
        return { name: it.name };
      }),
      quorum: settings.quorum,
      vote: settings.vote,
      significant_minority: settings.significant_minority,
      decision_delay: settings.decision_delay,
      dispute_time_limit: settings.dispute_time_limit,
      is_workgroup: settings.is_workgroup,
      workgroup: settings.workgroup,
      is_secret_ballot: settings.is_secret_ballot,
      is_can_offer: settings.is_can_offer,
      is_minority_not_participate: settings.is_minority_not_participate,
      is_default_add_member: settings.is_default_add_member,
      is_not_delegate: settings.is_not_delegate,
    };
    if (parent_community_id) {
      formData['parent_community_id'] = parent_community_id;
    }

    return formData;
  }

  private async _getOrCreateName(
    nameInst: CommunityNameModel,
    communityId: string | undefined,
    userId: string
  ) {
    if (nameInst.id) {
      return nameInst;
    } else {
      return await this._createName(nameInst.name, communityId, userId);
    }
  }

  private async _createName(
    name: string,
    communityId: string | undefined,
    userId: string
  ) {
    const nameService = new CrudDataSourceService(CommunityNameModel);
    const nameObj = nameService.createRecord();
    nameObj.name = name;
    nameObj.creator_id = userId;
    nameObj.community_id = communityId;

    return nameService.save(nameObj, true);
  }

  private async _getOrCreateDescription(
    descriptionInst: CommunityDescriptionModel,
    communityId: string | undefined,
    userId: string
  ) {
    if (descriptionInst.id) {
      return descriptionInst;
    } else {
      return await this._createDescription(
        descriptionInst.value,
        communityId,
        userId
      );
    }
  }

  private async _getOrCreateResponsibility(
    responsibility: ResponsibilityModel,
    communityId: string | undefined,
    userId: string
  ) {
    if (responsibility.id) {
      return responsibility;
    } else {
      return await this._createResponsibility(
        responsibility.name,
        communityId,
        userId
      );
    }
  }

  private async _createResponsibility(
    name: string,
    communityId: string | undefined,
    userId: string
  ) {
    const responsibilityService = new CrudDataSourceService(
      ResponsibilityModel
    );
    const responsibilityObj = responsibilityService.createRecord();
    responsibilityObj.name = name;
    responsibilityObj.creator_id = userId;
    responsibilityObj.community_id = communityId;

    return responsibilityService.save(responsibilityObj, true);
  }

  private async _createDescription(
    value: string,
    communityId: string | undefined,
    userId: string
  ) {
    const descriptionService = new CrudDataSourceService(
      CommunityDescriptionModel
    );
    const descriptionObj = descriptionService.createRecord();
    descriptionObj.value = value;
    descriptionObj.creator_id = userId;
    descriptionObj.community_id = communityId;

    return descriptionService.save(descriptionObj, true);
  }

  responsibility;

  private async _getOrCreateCategories(
    categoriesInst: CategoryModel[],
    communityId: string | undefined,
    userId: string
  ) {
    // FIXME: переделать.
    const categories: CategoryModel[] = [];
    for (const category of categoriesInst) {
      if (category) {
        if (category.id) {
          categories.push(category);
        } else {
          const newCategory = await this._createCategory(
            category,
            communityId,
            userId
          );
          categories.push(newCategory);
        }
      }
    }
    return categories;
  }

  private async _createCategory(
    category: CategoryModel,
    communityId: string | undefined,
    userId: string
  ) {
    const categoryService = new CrudDataSourceService(CategoryModel);
    const status = await this._getStatusByCode(OnConsiderationCode);
    category.creator_id = userId;
    category.community_id = communityId;
    category.status = status;

    return await categoryService.save(category, true);
  }

  private async _getOrCreateSubSettings(
    settings: UserCommunitySettingsModel,
    parent_community_id: string
  ) {
    if (settings.id) return Promise.resolve(settings);

    const formData = this.settingsToFormData(settings, parent_community_id);

    return this.createChildSettings(formData);
  }

  private async _getStatusByCode(code: string) {
    const statusService = new CrudDataSourceService(StatusModel);
    const resp = await statusService.list([
      {
        field: 'code',
        op: 'equals',
        val: code,
      },
    ]);

    return resp.total ? resp.data[0] : undefined;
  }
}
