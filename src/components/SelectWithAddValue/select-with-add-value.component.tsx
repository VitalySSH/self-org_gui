import {
    Button,
    ConfigProvider,
    Divider,
    Empty,
    Input,
    InputRef,
    Select,
    Space
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SelectInterface } from "../../interfaces";
import React, { ChangeEvent, useRef, useState} from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";


export function SelectWithAddValue(props: SelectInterface) {

    const inputRef = useRef<InputRef>(null);
    const textAreaRef =
        useRef<TextAreaRef>(null);
    const [newTextValue, setNewTextValue] =
        useState('');

    const onValueChange = (value: string, option: any) => {
        if (Array.isArray(option)) {
            props.fieldData.currentValues = option.map((it) => it.obj);
        } else {
            props.fieldData.currentValues = option?.obj ? [option.obj] : [];
        }
        props.form.setFieldValue(props.formField, value);
    }

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setNewTextValue(text);
    }

    const onTextareaChange = () => {
        const text =
            textAreaRef.current?.resizableTextArea?.textArea.value || '';
        setNewTextValue(text);
    }

    const addNewValue = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (!Array.isArray(props.fieldData.options)) {
            props.fieldData.options = [];
        }
        const currentValues =
            (props.fieldData.currentValues || [])
                .map((it) => it[props.bindLabel]);
        if (!currentValues.includes(newTextValue)) {
            const newObj = props.fieldService.createRecord();
            newObj[props.bindLabel] = newTextValue;
            props.fieldData.options.push(newObj);
        }
        setNewTextValue('');

    }

    const getCurrentValue = () => {
        if (props.multiple) {
            if (Array.isArray(props.fieldData.currentValues)) {
                return props.fieldData.currentValues
                    .map((it) => it[props.bindLabel]);
            } else {
                return [];
            }
        } else {
            if (Array.isArray(props.fieldData.currentValues)) {
                if (props.fieldData.currentValues.length > 0) {
                    return props.fieldData.currentValues[0][props.bindLabel];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    }

    return (
        <ConfigProvider renderEmpty={
            () => {
                return <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Значения не найдены"
                />;
            }
        }>
            <Select
                onChange={onValueChange}
                showSearch={true}
                value={ getCurrentValue() }
                mode={ props.multiple ? 'multiple' : undefined }
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                            {
                                props.fieldType === 'input' ?
                                    <Input
                                        placeholder={props.placeholder}
                                        ref={inputRef}
                                        onChange={onInputChange}
                                        value={newTextValue}
                                        onKeyDown={(e) =>
                                            e.stopPropagation()}
                                        style={{ width: 400 }}
                                    /> :
                                    <TextArea
                                        rows={5}
                                        placeholder={props.placeholder}
                                        ref={textAreaRef}
                                        onChange={onTextareaChange}
                                        value={newTextValue}
                                        onKeyDown={(e) =>
                                            e.stopPropagation()}
                                        style={{ width: 400 }}
                                    />
                            }
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={addNewValue}
                            >
                                Добавить
                            </Button>
                        </Space>
                    </>
                )}
                options={
                    (props.fieldData.options || [])
                        .map((item: any) => (
                            {
                                value: item[props.bindLabel],
                                obj: item,
                            }
                        ))
                }
                allowClear={true}
            />
        </ConfigProvider>
    );
}
