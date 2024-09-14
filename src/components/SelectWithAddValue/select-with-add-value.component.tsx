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
import React, { ChangeEvent, useEffect, useRef, useState} from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";


export function SelectWithAddValue(props: SelectInterface) {

    const inputRef = useRef<InputRef>(null);
    const textAreaRef =
        useRef<TextAreaRef>(null);
    const [newTextValue, setNewTextValue] =
        useState('');
    const [currentValue, setCurrentValue] =
        useState([] as any[]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentFieldValue = () => {
        if (!currentValue.length) {
            const values =
                props.fieldData.map((it) => it[props.bindLabel]);
            setCurrentValue(values);
        }
    }

    useEffect(() => {
        currentFieldValue();
    }, [currentFieldValue, setCurrentValue])

    const onValueChange = (value: string, option: any) => {
        if (Array.isArray(value)) {
            setCurrentValue(value);
        } else {
            setCurrentValue([value]);
        }
        if (Array.isArray(option)) {
            props.setFieldData(option.map((it) => it.obj));
        } else {
            props.setFieldData([option?.obj]);
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
        const currentValues =
            props.options.map((it) => it[props.bindLabel]);
        if (!currentValues.includes(newTextValue)) {
            const newObj = props.fieldService.createRecord();
            newObj[props.bindLabel] = newTextValue;
            props.options.push(newObj);
            props.setOptions(props.options);
        }
        setNewTextValue('');

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
                // FIXME: у параметра value типы не поддерживают массив со
                // строками, хотя в данном случае компонент работает корректно.
                // Разобраться
                value={currentValue.length === 1 ? currentValue[0] :
                    currentValue.length > 1 ? currentValue : null }
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
                    props.options.map((item: any) => (
                        {
                            value: item[props.bindLabel],
                            obj: item,
                        }
                    ))
                }
                optionLabelProp="optionLabelProp"
                allowClear={true}
            />
        </ConfigProvider>
    )
}
