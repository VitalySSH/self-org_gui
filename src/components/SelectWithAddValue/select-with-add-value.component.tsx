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
import { ChangeEvent, useRef } from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";


export function SelectWithAddValue(props: SelectInterface) {

    const inputRef = useRef<InputRef>(null);
    const textAreaRef =
        useRef<TextAreaRef>(null);


    const onValueChange = (value: string, option: any) => {
        props.setObj(option?.obj);
        props.setFormValue(value);
    }

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        props.setNewTextValue(text);
    }

    const onTextareaChange = () => {
        const text =
            textAreaRef.current?.resizableTextArea?.textArea.value || '';
        props.setNewTextValue(text);
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
                value={props.formValue}
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
                                        value={props.newTextValue}
                                        onKeyDown={(e) =>
                                            e.stopPropagation()}
                                        style={{ width: 400 }}
                                    /> :
                                    <TextArea
                                        rows={5}
                                        placeholder="Введите своё описание"
                                        ref={textAreaRef}
                                        onChange={onTextareaChange}
                                        value={props.newTextValue}
                                        onKeyDown={(e) =>
                                            e.stopPropagation()}
                                        style={{ width: 400 }}
                                    />
                            }
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={props.addNewObj}>
                                Добавить
                            </Button>
                        </Space>
                    </>
                )}
                options={
                    props.objs.map((item: any) => (
                        {
                            label: item[props.bindLabel],
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
