import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute } from "../annotations";

@modelConfig({
    entityName: 'status',
})
export class StatusModel extends ApiModel{
    @attribute()
    code?: string;

    @attribute()
    name?: string;

}