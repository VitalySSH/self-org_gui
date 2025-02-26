import { CrudDataSourceService } from 'src/services';
import { RuleModel } from 'src/models';
import { CreatingRuleInterface } from 'src/interfaces';
import { AOApiUrl } from 'src/config/configuration';

export class RuleAoService extends CrudDataSourceService<RuleModel> {
  constructor() {
    super(RuleModel, AOApiUrl);
  }

  async create_rule(data: CreatingRuleInterface) {
    const url = `/${this.model.entityName}/create_rule`;
    await this.http.post<void>(url, data);
  }
}
