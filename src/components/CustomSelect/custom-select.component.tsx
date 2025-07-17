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
  useMemo,
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
  const [value, setValue] = useState<T | T[] | null>(null);
  const [fieldValue, setFieldValue] = useState<string | string[] | null>(null);
  const [options, setOptions] = useState<T[] | null>(null);
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
      // Точно такая же проверка как в рабочей версии
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
          _initFieldValue = props.value
            .filter(item => item && typeof item === 'object' && props.bindLabel in item)
            .map((it) => (it as any)[props.bindLabel]);
        }
      } else {
        if (Array.isArray(props.value)) {
          if (props.value.length > 0 && props.value[0] && typeof props.value[0] === 'object' && props.bindLabel in props.value[0]) {
            _initFieldValue = (props.value[0] as any)[props.bindLabel];
          }
        } else if (props.value !== undefined && props.value && typeof props.value === 'object' && props.bindLabel in props.value) {
          _initFieldValue = (props.value as any)[props.bindLabel];
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
      currentFieldValue = (currentValue || []).map((it) => (it as any)[props.bindLabel]);
    } else {
      if (option?.obj) {
        currentValue = option.obj;
        currentFieldValue = (option.obj as any)[props.bindLabel];
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
    setNewTextValue(event.target.value);
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
      const _currentValues = value
        .filter(item => item && typeof item === 'object' && props.bindLabel in item)
        .map((it: any) => it[props.bindLabel]);
      currentValues.push(..._currentValues);
    } else if (value !== null && value && typeof value === 'object' && props.bindLabel in value) {
      currentValues.push((value as any)[props.bindLabel]);
    }

    if (props.fieldService && newTextValue.trim() && !currentValues.includes(newTextValue.trim())) {
      const newObj = props.fieldService.createRecord();
      (newObj as any)[props.bindLabel] = newTextValue.trim();
      const currentOptions = options || [];

      if (props.saveOwnValue) {
        props.fieldService
          .save(newObj)
          .then((resp) => {
            setOptions([...currentOptions, resp]);
          })
          .catch((error) => {
            console.error('Ошибка создания нового значения в селекторе:', error);
            setOptions([]);
          });
      } else {
        setOptions([...currentOptions, newObj]);
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

  const selectOptions = useMemo(() => {
    return (options || []).map((item: T) => {
      const labelValue = item && typeof item === 'object' && props.bindLabel in item
        ? (item as any)[props.bindLabel]
        : '';

      return {
        key: item?.id || Math.random().toString(36),
        value: labelValue,
        label: labelValue,
        obj: item,
      };
    });
  }, [options, props.bindLabel]);

  const renderLoadMoreButton = () => {
    if (
      (options || []).length >= totalOptions ||
      searchQuery.length < MIN_SEARCH_CHARS
    )
      return null;

    return (
      <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
        <Button
          type="link"
          onClick={() => fetchOptions(currentPage + 1, true)}
          loading={isLoading}
          style={{ width: '100%', padding: 0 }}
          size="small"
        >
          {isLoading ? 'Загрузка...' : 'Загрузить ещё'}
        </Button>
      </div>
    );
  };

  const renderDropdownContent = (menu: React.ReactNode) => {
    if (isDropdownOpen && isLoading) {
      return (
        <div className="custom-select-loading">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="custom-select-dropdown-content">
        <div className="custom-select-menu" style={{ maxHeight: 300, overflowY: 'auto' }}>
          {props.enableSearch && showMinCharsHint ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`Введите минимум ${MIN_SEARCH_CHARS} символа для поиска`}
              style={{ padding: '20px 0' }}
            />
          ) : (
            <>
              {menu}
              {renderLoadMoreButton()}
            </>
          )}
        </div>
        {props.addOwnValue && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <div className="add-own-value-container">
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {props.ownFieldTextarea ? (
                  <TextArea
                    rows={2}
                    placeholder={props.ownValuePlaceholder}
                    ref={textAreaRef}
                    onChange={onTextareaChange}
                    value={newTextValue}
                    onKeyDown={(e) => e.stopPropagation()}
                    maxLength={props.ownValueMaxLength}
                  />
                ) : (
                  <Input
                    placeholder={props.ownValuePlaceholder}
                    ref={inputRef}
                    onChange={onInputChange}
                    value={newTextValue}
                    onKeyDown={(e) => e.stopPropagation()}
                    maxLength={props.ownValueMaxLength}
                  />
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addOwnValue}
                  disabled={!newTextValue.trim()}
                  size="small"
                  block
                >
                  Добавить
                </Button>
              </Space>
            </div>
          </>
        )}
      </div>
    );
  };

  const emptyRender = useCallback(() => {
    if (isLoading && !options) return null;
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={searchQuery ? 'Ничего не найдено' : 'Значения не найдены'}
        style={{ padding: '20px 0' }}
      />
    );
  }, [isLoading, options, searchQuery]);

  return (
    <ConfigProvider renderEmpty={emptyRender}>
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
        options={selectOptions}
        loading={isLoading && !options}
        placeholder={props.label}
        allowClear={true}
        style={{ width: '100%' }}
        popupClassName="custom-select-dropdown"
      />
    </ConfigProvider>
  );
}