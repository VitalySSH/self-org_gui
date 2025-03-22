import { CrudDataSourceService } from 'src/services';
import { InitiativeModel } from 'src/models';
import { CreatingInitiativeInterface } from 'src/interfaces';
import { AOApiUrl } from 'src/config/configuration';

export class InitiativeAoService extends CrudDataSourceService<InitiativeModel> {
  constructor() {
    super(InitiativeModel, AOApiUrl);
  }

  async createInitiative(data: CreatingInitiativeInterface) {
    const url = `/${this.model.entityName}/create_initiative`;
    await this.http.post<void>(url, data);
  }
}
