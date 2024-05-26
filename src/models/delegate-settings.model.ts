import { ApiModel } from "./api-model.model.ts";
import { modelConfig, oneToMany, manyToMany } from "../annotations";
import { UserModel } from "./user.model.ts";
import { InitiativeCategoryModel } from "./initiative-category.model.ts";

@modelConfig({
    entityName: 'delegate_settings',
})
export class DelegateSettingsModel extends ApiModel{
    @oneToMany('initiative_category')
    init_category?: InitiativeCategoryModel;

    @oneToMany('user')
    user?: UserModel;

    @manyToMany('user')
    delegates?: UserModel[];

}