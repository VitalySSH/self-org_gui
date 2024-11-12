import { ApiModel } from "./api-model.model.ts";
import { attribute, manyToMany, modelConfig } from "../annotations";
import { VotingOptionModel } from "./voting-option.model.ts";

@modelConfig({
    entityName: 'user_voting_result',
})
export class UserVotingResultModel extends ApiModel{

    @attribute()
    vote?: boolean;

    @attribute()
    is_voted_myself?: boolean;

    @attribute()
    member_id?: string;

    @attribute()
    initiative_id?: string;

    @attribute()
    rule_id?: string;

    @manyToMany('voting_option')
    extra_options?: VotingOptionModel[];

}