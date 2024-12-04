import { FormInstance } from "antd";
import { CrudDataSourceService } from "src/services";
import { SelectDataInterface } from "src/interfaces";

type FieldType = 'input' | 'textarea';


export interface SelectInterface {
    form: FormInstance;
    fieldService: CrudDataSourceService<any>;
    fieldType: FieldType;
    fieldData: SelectDataInterface<any>;
    formField: string;
    bindLabel: string;
    placeholder: string;
    multiple?: boolean;
}