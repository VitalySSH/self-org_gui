import {
  Button,
  ConfigProvider,
  Divider,
  Empty,
  Input,
  InputRef,
  Select,
  Space,
  Spin,
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
import { useDebounceFn } from 'ahooks';
import { Filters } from 'src/shared/types.ts';
import './custom-select.component.scss';

export function CustomSelect<T extends ApiModel>(props: SelectInterface<T>) {
  const inputRef = useRef<InputRef>(null);
  const textAreaRef = useRef<TextAreaRef>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOptions, setTotalOptions] = useState(0);
  const [uploadedFieldValue, setUploadedFieldValue] = useState(false);
  const [value, setValue] = useState(null as T | T[] | null);
  const [fieldValue, setFieldValue] = useState(
    null as string | string[] | null
  );
  const [options, setOptions] = useState(null as T[] | null);
  const [newTextValue, setNewTextValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMinCharsHint, setShowMinCharsHint] = useState(false);

  const MIN_SEARCH_CHARS = 3;

  const fetchOptions = useCallback(
    (
      page: number = 1,
      append: boolean = false,
      search: string = searchQuery
    ) => {
      if (
        (options || []).length >= totalOptions &&
        append &&
        (!search || !props.enableSearch)
      )
        return;

      setIsLoading(true);
      const filters: Filters = [];
      if (props.enableSearch && search?.length >= MIN_SEARCH_CHARS) {
        filters.push({
          field: props.bindLabel,
          op: 'ilike',
          val: search,
        });
      }
      props
        .requestOptions({ skip: page, limit: 20 }, filters)
        .then(({ data, total }) => {
          setTotalOptions(total);
          setOptions((prev) => {
            if (!append || search) return data;
            return [...(prev || []), ...data];
          });
          setCurrentPage(page);
        })
        .catch(() => setOptions([]))
        .finally(() => setIsLoading(false));
    },
    [props, searchQuery, options, totalOptions, props.enableSearch]
  );

  const { run: handleSearch } = useDebounceFn(
    (value: string) => {
      if (!props.enableSearch) return;

      setSearchQuery(value);
      const _isShowMinCharsHint =
        value?.length > 0 && value?.length < MIN_SEARCH_CHARS;
      setShowMinCharsHint(_isShowMinCharsHint);
      if (!_isShowMinCharsHint) fetchOptions(1, false, value);
    },
    { wait: 500 }
  );

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
    if (searchQuery?.length) {
      setSearchQuery('');
      fetchOptions(1, false, '');
    }
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

    if (props.fieldService && !currentValues.includes(newTextValue)) {
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

  const onDropdownVisibleChange = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open && !options) {
      fetchOptions(1);
    }
  };

  const renderDropdownContent = (menu: React.ReactNode) => {
    if (isDropdownOpen && isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 0',
        }}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {props.enableSearch && showMinCharsHint ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`Введите минимум ${MIN_SEARCH_CHARS} символа для поиска`}
            />
          ) : (
            <>
              {menu}
              {renderLoadMoreButton()}
            </>
          )}
        </div>
        {props.addOwnValue && addingOwnValue}
      </>
    );
  };

  const addingOwnValue = (
    <>
      <Divider style={{ margin: '8px 0' }} />
      <div className="add-own-value-container">
        <Space
          direction="vertical"
          size={12}
          style={{ width: '100%', padding: '0 4px' }}
        >
          {props.ownFieldTextarea ? (
            <TextArea
              rows={3}
              placeholder={props.ownValuePlaceholder}
              ref={textAreaRef}
              onChange={onTextareaChange}
              value={newTextValue}
              onKeyDown={(e) => e.stopPropagation()}
              maxLength={props.ownValueMaxLength}
              style={{ marginBottom: 0 }}
            />
          ) : (
            <Input
              placeholder={props.ownValuePlaceholder}
              ref={inputRef}
              onChange={onInputChange}
              value={newTextValue}
              onKeyDown={(e) => e.stopPropagation()}
              maxLength={props.ownValueMaxLength}
              style={{ marginBottom: 0 }}
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
      </div>
    </>
  );

  const renderLoadMoreButton = () => {
    if (
      (options || []).length >= totalOptions ||
      searchQuery.length < MIN_SEARCH_CHARS
    )
      return null;

    return (
      <Button
        type="link"
        onClick={() => fetchOptions(currentPage + 1, true)}
        loading={isLoading}
        style={{ width: '100%' }}
      >
        {isLoading ? 'Загрузка...' : 'Загрузить ещё'}
      </Button>
    );
  };

  return (
    <ConfigProvider
      renderEmpty={() => {
        if (isLoading && !options) return null;
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchQuery ? 'Ничего не найдено' : 'Значения не найдены'
            }
          />
        );
      }}
    >
      <Select
        showSearch={props.enableSearch}
        onChange={onValueChange}
        onSearch={props.enableSearch ? handleSearch : undefined}
        filterOption={false}
        dropdownRender={renderDropdownContent}
        onDropdownVisibleChange={onDropdownVisibleChange}
        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-expect-error
        value={fieldValue}
        mode={props.multiple ? 'multiple' : undefined}
        options={(options || []).map((item: any) => ({
          key: item.id,
          value: item[props.bindLabel],
          obj: item,
        }))}
        loading={isLoading}
        placeholder={props.label}
        allowClear={true}
        style={{ width: '100%' }}
        popupClassName="custom-select-dropdown"
      />
    </ConfigProvider>
  );
}
