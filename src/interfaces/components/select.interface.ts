import { FormInstance } from "antd";
import { CrudDataSourceService } from "../../services";
import { SelectDataInterface } from "./select-data.interface.ts";

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