import { CrudDataSourceService } from "src/services";
import {
    CommunityDescriptionModel,
    CommunityNameModel, 
    CategoryModel, 
    StatusModel,
    UserCommunitySettingsModel,
    UserModel
} from "src/models";
import { AOApiUrl } from "src/config/configuration";
import {
    CommunitySettingsInterface,
} from "src/interfaces";
import { OnConsiderationCode } from "src/consts";


export class UserSettingsAoService
    extends CrudDataSourceService<UserCommunitySettingsModel>{

    constructor() {
        super(UserCommunitySettingsModel, AOApiUrl);
    }

    async createCommunity(
        settings: CommunitySettingsInterface
    ) {
        const url = `/${this.model.entityName}/create_community`;

        return this.http.post<void>(url, settings);
    }

    async saveSettings(
        settings: UserCommunitySettingsModel,
        formData: CommunitySettingsInterface,
        communityId: string | undefined,
        user: UserModel,
        create: boolean = false,
    ) {
        const settingsService =
            new CrudDataSourceService(UserCommunitySettingsModel);
        if (create) {
            settings.user = user;
            settings.community_id = communityId;
        }
        const name =
            await this._getOrCreateName(formData.name, communityId, user.id);
        const description = await this._getOrCreateDescription(
            formData.description, communityId, user.id);
        const categories =
            await this._getOrCreateCategories(
                formData.categories, communityId, user.id);
        settings.name = name as CommunityNameModel;
        settings.description = description as CommunityDescriptionModel;
        settings.categories = categories as CategoryModel[];
        settings.vote = formData.vote;
        settings.quorum = formData.quorum;
        settings.significant_minority = formData.significant_minority;
        settings.is_secret_ballot = formData.is_secret_ballot;
        settings.is_can_offer = formData.is_can_offer;
        settings.is_minority_not_participate =
            formData.is_minority_not_participate;
        settings.is_default_add_member = formData.is_default_add_member;
        settings.is_not_delegate = formData.is_not_delegate;

        return settingsService.save(settings, create);
    }

    private async _getOrCreateName(
        nameInst: CommunityNameModel,
        communityId: string | undefined,
        userId: string,
    ) {
        if (nameInst === undefined) {
            return undefined
        } else if (nameInst.id) {
            return nameInst;
        } else {
            return await this._createName(nameInst.name, communityId, userId);
        }
    }

    private async _createName(
        name: string | undefined,
        communityId: string | undefined,
        userId: string,
    ) {
        const nameService =
            new CrudDataSourceService(CommunityNameModel);
        const nameObj = nameService.createRecord();
        nameObj.name = name;
        nameObj.creator_id = userId;
        nameObj.community_id = communityId

        return nameService.save(nameObj, true);
    }

    private async _getOrCreateDescription(
        descriptionInst: CommunityDescriptionModel,
        communityId: string | undefined,
        userId: string,
    ) {
        if (descriptionInst === undefined) {
            return undefined
        } else if (descriptionInst.id) {
            return descriptionInst;
        } else {
            return await this._createDescription(
                descriptionInst.value, communityId, userId);
        }
    }

    private async _createDescription(
        value: string | undefined,
        communityId: string | undefined,
        userId: string,
    ) {
        const descriptionService =
            new CrudDataSourceService(CommunityDescriptionModel);
        const descriptionObj =
            descriptionService.createRecord();
        descriptionObj.value = value;
        descriptionObj.creator_id = userId;
        descriptionObj.community_id = communityId

        return descriptionService.save(descriptionObj, true);
    }

    private async _getOrCreateCategories(
        categoriesInst: CategoryModel[],
        communityId: string | undefined,
        userId: string,
    ) {
        if (categoriesInst.length) {
            const categories: CategoryModel[] = [];
            for (const category of categoriesInst) {
                if (category) {
                    if (category.id) {
                        categories.push(category);
                    } else {
                        const newCategory =
                            await this._createCategory(
                                category, communityId, userId);
                        categories.push(newCategory);
                    }
                }
            }
            return categories;
        } else {
            return undefined;
        }
    }

    private async _createCategory(
        category: CategoryModel,
        communityId: string | undefined,
        userId: string,
    ) {
        const categoryService =
            new CrudDataSourceService(CategoryModel);
        const status =
            await this._getStatusByCode(OnConsiderationCode);
        category.creator_id = userId;
        category.community_id = communityId;
        category.status = status;

        return await categoryService.save(category, true);
    }

    private async _getStatusByCode(code: string) {
        const statusService =
            new CrudDataSourceService(StatusModel);
        const statuses = await statusService.list([
            {
                field: 'code',
                op: 'equals',
                val: code,
            }
        ]);

        return statuses.length ? statuses[0] : undefined;
    }

}
