import { ApiModel } from "./api-model.model.ts";
import { attribute, manyToMany, modelConfig } from "../annotations";
import { VotingOptionModel } from "./voting-option.model.ts";

@modelConfig({
    entityName: 'voting_result',
})
export class VotingResultModel extends ApiModel{

    @attribute()
    vote?: boolean;

    @attribute()
    is_significant_minority?: boolean;

    @manyToMany('voting_option')
    selected_options?: VotingOptionModel[];

}