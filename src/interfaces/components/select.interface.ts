import { CrudDataSourceService } from "src/services";
import { ApiModel } from "src/models";


export interface SelectInterface<T extends ApiModel> {
    fieldService: CrudDataSourceService<any>;
    requestOptions: () => Promise<T[]>;
    onChange: (fieldName: string, value: any) => void;
    value?: T | T[];
    formField: string;
    bindLabel: string;
    multiple?: boolean;
    addOwnValue?: boolean;
    saveOwnValue?: boolean;
    ownValuePlaceholder?: string;
    ownFieldTextarea?: boolean;
}