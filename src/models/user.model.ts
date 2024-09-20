import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute, manyToMany } from "../annotations";
import { RequestMemberModel } from "./request-member.model.ts";

@modelConfig({
    entityName: 'user',
})
export class UserModel extends ApiModel{
    @attribute()
    firstname?: string;

    @attribute()
    surname?: string;

    @attribute()
    about_me?: string;

    @attribute()
    foto_id?: string | null;

    @attribute()
    email?: string;

    @attribute()
    is_active?: boolean;

    @attribute()
    hashed_password?: string;

    @manyToMany('request_member')
    adding_communities?: RequestMemberModel[]

}