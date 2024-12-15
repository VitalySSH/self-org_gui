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
import { SelectInterface } from "src/interfaces";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import { ApiModel } from "src/models";


export function CustomSelect<T extends ApiModel>(props: SelectInterface<T>) {

    const inputRef = useRef<InputRef>(null);
    const textAreaRef =
        useRef<TextAreaRef>(null);

    const [uploadedFieldValue,
        setUploadedFieldValue] =
        useState(false);
    const [value, setValue] =
        useState(null as T | T[] | null);
    const [fieldValue, setFieldValue] =
        useState(null as string | string[] | null);
    const [options, setOptions] =
        useState(undefined as T[] | undefined);
    const [newTextValue, setNewTextValue] =
        useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCurrentValue = () => {
        if (fieldValue === null && !uploadedFieldValue) {
            let _currentFieldValue: string | string[] | null = null;
            if (props.value === undefined) {
                setValue(null);
            } else {
                setValue(props.value);
            }
            if (props.multiple) {
                if (Array.isArray(props.value)) {
                    _currentFieldValue =
                        props.value.map((it) => it[props.bindLabel]);
                }
            } else {
                if (Array.isArray(props.value)) {
                    if (props.value.length > 0) {
                        _currentFieldValue = props.value[0][props.bindLabel];
                    }
                } else if (props.value !== undefined) {
                    _currentFieldValue = props.value[props.bindLabel];
                }
            }
            if (_currentFieldValue !== null) setUploadedFieldValue(true);
            setFieldValue(_currentFieldValue);
        }
    }

    useEffect(() => {
        if (options === undefined) {
            props.requestOptions().then(resp => {
                setOptions(resp);
            }).catch((error) => {
                setOptions([]);
                console.log(`Ошибка получения options в селекторе: ${error}`);
            });
        }
        getCurrentValue();
    }, [options, props, props.requestOptions, getCurrentValue]);

    const onValueChange = (_: string, option: any) => {
        if (!uploadedFieldValue) {
            setUploadedFieldValue(true);
        }
        let currentValue: T | T[] | null = null;
        let currentFieldValue: string | string[] | null = null;
        if (Array.isArray(option)) {
            currentValue = option.map((it) => it.obj);
            currentFieldValue =
                currentValue.map((it) => it[props.bindLabel]);
        } else {
            if (option?.obj) {
                currentValue = option.obj;
                currentFieldValue = option.obj[props.bindLabel];
            }
        }
        setFieldValue(currentFieldValue);
        props.onChange(props.formField, currentValue);
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

    const addOwnValue = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        const currentValues: string[] = [];
        if (Array.isArray(value)) {
            const _currentValues =
                value.map((it: { [x: string]: any; }) => it[props.bindLabel]);
            currentValues.push(..._currentValues);
        } else if (value !== null) {
            currentValues.push(value[props.bindLabel])
        }

        if (!currentValues.includes(newTextValue)) {
            const newObj = props.fieldService.createRecord();
            newObj[props.bindLabel] = newTextValue;
            const currentOptions = options || [];
            if (props.saveOwnValue) {
                props.fieldService.save(newObj).then(resp => {
                    currentOptions.push(resp);
                    setOptions(currentOptions);
                }).catch((error) => {
                    setOptions([]);
                    console.log(
                        `Ошибка создания нового згачения в селекторе: ${error}`
                    );
                });
            } else {
                currentOptions.push(newObj);
                setOptions(currentOptions);
            }
        }
        setNewTextValue('');

    }
    
    const addingOwnValue = (
        <>
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
                 {
                    props.ownFieldTextarea ?
                        <TextArea
                            rows={5}
                            placeholder={props.ownValuePlaceholder}
                            ref={textAreaRef}
                            onChange={onTextareaChange}
                            value={newTextValue}
                            onKeyDown={(e) =>
                                e.stopPropagation()}
                            style={{ width: 400 }}
                        /> :
                        <Input
                            placeholder={props.ownValuePlaceholder}
                            ref={inputRef}
                            onChange={onInputChange}
                            value={newTextValue}
                            onKeyDown={(e) =>
                                e.stopPropagation()}
                            style={{ width: 400 }}
                        />
                }
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={addOwnValue}
                    disabled={newTextValue.length === 0}
                >
                    Добавить
                </Button>
            </Space>
        </>
    );

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
                /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                // @ts-expect-error
                value={fieldValue}
                mode={ props.multiple ? 'multiple' : undefined }
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        {props.addOwnValue && addingOwnValue}
                    </>
                )}
                options={
                    (options || [])
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
