import { FormInstance } from "antd";
import { CrudDataSourceService } from "../../services";

type SetFieldData = (d: any[]) => void;
type SetOptions = (d: any[]) => void;
type FieldType = 'input' | 'textarea';


export interface SelectInterface {
    options: any[];
    setOptions: SetOptions;
    form: FormInstance;
    fieldService: CrudDataSourceService<any>;
    fieldType: FieldType;
    fieldData: any[];
    setFieldData: SetFieldData;
    formField: string;
    bindLabel: string;
    placeholder: string;
    multiple?: boolean;
}