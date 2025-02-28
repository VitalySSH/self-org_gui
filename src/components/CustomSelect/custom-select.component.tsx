import {
  Button,
  ConfigProvider,
  Divider,
  Empty,
  Input,
  InputRef,
  Select,
  Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SelectInterface } from 'src/interfaces';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import TextArea, { TextAreaRef } from 'antd/lib/input/TextArea';
import { ApiModel } from 'src/models';

export function CustomSelect<T extends ApiModel>(props: SelectInterface<T>) {
  const inputRef = useRef<InputRef>(null);
  const textAreaRef = useRef<TextAreaRef>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOptions, setTotalOptions] = useState(0);
  const [uploadedFieldValue, setUploadedFieldValue] = useState(false);
  const [value, setValue] = useState(null as T | T[] | null);
  const [fieldValue, setFieldValue] = useState(
    null as string | string[] | null
  );
  const [options, setOptions] = useState(null as T[] | null);
  const [newTextValue, setNewTextValue] = useState('');

  const fetchOptions = (page: number = 1, append: boolean = false) => {
      if ((options || []).length >= totalOptions && append) return;

      setIsLoading(true);
      props
        .requestOptions({ skip: page, limit: 20 })
        .then(({ data, total }) => {
          setTotalOptions(total);
          setOptions((prev) => (append ? [...(prev || []), ...data] : data));
          setCurrentPage(page);
        })
        .catch(() => setOptions([]))
        .finally(() => {
          setIsLoading(false);
        });
    };

  const getInitValue = useCallback(() => {
    if (fieldValue === null && !uploadedFieldValue) {
      let _initFieldValue: string | string[] | null = null;
      if (props.value === undefined) {
        setValue(null);
      } else {
        setValue(props.value);
      }
      if (props.multiple) {
        if (Array.isArray(props.value)) {
          _initFieldValue = props.value.map((it) => it[props.bindLabel]);
        }
      } else {
        if (Array.isArray(props.value)) {
          if (props.value.length > 0) {
            _initFieldValue = props.value[0][props.bindLabel];
          }
        } else if (props.value !== undefined) {
          _initFieldValue = props.value[props.bindLabel];
        }
      }
      if (_initFieldValue !== null) setUploadedFieldValue(true);
      setFieldValue(_initFieldValue);
    }
  }, [
    fieldValue,
    props.bindLabel,
    props.multiple,
    props.value,
    uploadedFieldValue,
  ]);

  useEffect(() => {
    getInitValue();
  }, [getInitValue]);

  const onValueChange = (_: string, option: any) => {
    if (!uploadedFieldValue) {
      setUploadedFieldValue(true);
    }
    let currentValue: T | T[] | null = null;
    let currentFieldValue: string | string[] | null = null;
    if (Array.isArray(option)) {
      option.forEach((it) => {
        if (it.obj) {
          if (Array.isArray(currentValue)) {
            currentValue.push(it.obj);
          } else {
            currentValue = [];
            currentValue.push(it.obj);
          }
        }
      });
      currentFieldValue = (currentValue || []).map((it) => it[props.bindLabel]);
    } else {
      if (option?.obj) {
        currentValue = option.obj;
        currentFieldValue = option.obj[props.bindLabel];
      }
    }
    setFieldValue(currentFieldValue);
    props.onChange(props.formField, currentValue);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setNewTextValue(text);
  };

  const onTextareaChange = () => {
    const text = textAreaRef.current?.resizableTextArea?.textArea.value || '';
    setNewTextValue(text);
  };

  const addOwnValue = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    const currentValues: string[] = [];
    if (Array.isArray(value)) {
      const _currentValues = value.map(
        (it: { [x: string]: any }) => it[props.bindLabel]
      );
      currentValues.push(..._currentValues);
    } else if (value !== null) {
      currentValues.push(value[props.bindLabel]);
    }

    if (!currentValues.includes(newTextValue)) {
      const newObj = props.fieldService.createRecord();
      newObj[props.bindLabel] = newTextValue;
      const currentOptions = options || [];
      if (props.saveOwnValue) {
        props.fieldService
          .save(newObj)
          .then((resp) => {
            currentOptions.push(resp);
            setOptions(currentOptions);
          })
          .catch((error) => {
            setOptions([]);
            console.log(
              `Ошибка создания нового значения в селекторе: ${error}`
            );
          });
      } else {
        currentOptions.push(newObj);
        setOptions(currentOptions);
      }
    }
    setNewTextValue('');
  };

  const addingOwnValue = (
    <>
      <Divider style={{ margin: '8px 0' }} />
      <Space style={{ padding: '0 8px 4px' }}>
        {props.ownFieldTextarea ? (
          <TextArea
            rows={5}
            placeholder={props.ownValuePlaceholder}
            ref={textAreaRef}
            onChange={onTextareaChange}
            value={newTextValue}
            onKeyDown={(e) => e.stopPropagation()}
            maxLength={props.ownValueMaxLength}
            style={{ width: 400 }}
          />
        ) : (
          <Input
            placeholder={props.ownValuePlaceholder}
            ref={inputRef}
            onChange={onInputChange}
            value={newTextValue}
            onKeyDown={(e) => e.stopPropagation()}
            maxLength={props.ownValueMaxLength}
            style={{ width: 400 }}
          />
        )}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addOwnValue}
          disabled={newTextValue.length === 0}
        >
          Добавить
        </Button>
      </Space>
    </>
  );

  const renderLoadMoreButton = () => {
    if ((options || []).length >= totalOptions) return null;

    return (
      <Button
        type="link"
        onClick={() => fetchOptions(currentPage + 1, true)}
        loading={isLoading}
        style={{ width: '100%' }}
      >
        {isLoading ? 'Загрузка...' : 'Больше значений'}
      </Button>
    );
  };

  return (
    <ConfigProvider
      renderEmpty={() => {
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Значения не найдены"
          />
        );
      }}
    >
      <Select
        onChange={onValueChange}
        // TODO: добавить фильтрацию для использования в CRUD сервисе
        // showSearch={true}
        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-expect-error
        value={fieldValue}
        mode={props.multiple ? 'multiple' : undefined}
        dropdownRender={(menu) => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{ maxHeight: 200, overflowY: 'auto' }}
            >
              {menu}
              {renderLoadMoreButton()}
            </div>
            {props.addOwnValue && addingOwnValue}
          </div>
        )}
        onDropdownVisibleChange={(open) => {
          if (open && !options) {
            fetchOptions(1);
          }
        }}
        options={(options || []).map((item: any) => ({
          value: item[props.bindLabel],
          obj: item,
        }))}
        placeholder={props.label}
        allowClear={true}
      />
    </ConfigProvider>
  );
}
