import React from "react";

type AddNewObj =
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
type SetObj = (a: any) => void;
type SetFormValue = (a: string) => void;
type SetNewTextValue = (a: string) => void;
type FieldType = 'input' | 'textarea';

export interface SelectInterface {
    objs: any[];
    addNewObj: AddNewObj;
    fieldType: FieldType;
    setObj: SetObj;
    formValue: string | undefined;
    setFormValue: SetFormValue;
    newTextValue: string;
    setNewTextValue: SetNewTextValue;
    bindLabel: string;
    placeholder: string;
}