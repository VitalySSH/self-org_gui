import { ApiModel } from "./api-model.model.ts";
import { attribute, manyToMany, modelConfig, oneToMany } from "../annotations";
import { UserModel } from "./user.model.ts";
import { StatusModel } from "./status.model.ts";
import { CategoryModel } from "./category.model.ts";
import { VotingResultModel } from "./voting-result.model.ts";
import { VotingOptionModel } from "./voting-option.model.ts";
import { UserVotingResultModel } from "./user-voting-result.model.ts";
import { OpinionModel } from "./opinion.model.ts";

@modelConfig({
    entityName: 'rule',
})
export class RuleModel extends ApiModel{

    @attribute()
    title?: string;

    @attribute()
    question?: string;

    @attribute()
    content?: string;

    @attribute()
    is_extra_options?: boolean;

    @attribute()
    is_multi_select?: boolean;

    @attribute()
    community_id?: string;

    @oneToMany('user')
    creator?: UserModel;

    @oneToMany('status')
    status?: StatusModel;

    @oneToMany('category')
    category?: CategoryModel;

    @oneToMany('voting_result')
    voting_result?: VotingResultModel;

    @manyToMany('voting_option')
    extra_options?: VotingOptionModel[];

    @manyToMany('user_voting_result')
    user_results?: UserVotingResultModel[];

    @manyToMany('opinion')
    opinions?: OpinionModel[];

}