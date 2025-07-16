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

  // Мемоизированные селекторы для оптимизации
  const selectOptions = useMemo(() => {
    if (!options) return [];

    return options.map((item: T) => {
      // Безопасная проверка наличия свойства
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

  const hasMoreOptions = useMemo(() => {
    return (options?.length || 0) < totalOptions && searchQuery.length >= MIN_SEARCH_CHARS;
  }, [options?.length, totalOptions, searchQuery.length]);

  const fetchOptions = useCallback(
    async (
      page: number = 1,
      append: boolean = false,
      search: string = searchQuery
    ) => {
      // Предотвращаем лишние запросы
      if (hasMoreOptions && append && (!search || !props.enableSearch)) {
        return;
      }

      setIsLoading(true);

      try {
        const filters: Filters = [];
        if (props.enableSearch && search?.length >= MIN_SEARCH_CHARS) {
          filters.push({
            field: props.bindLabel,
            op: 'ilike',
            val: search,
          });
        }

        const response = await props.requestOptions(
          { skip: page, limit: 20 },
          filters
        );

        const { data, total } = response;
        setTotalOptions(total);

        setOptions((prev) => {
          if (!append || search) return data;
          return [...(prev || []), ...data];
        });

        setCurrentPage(page);
      } catch (error) {
        console.error('Error fetching options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [props, searchQuery, hasMoreOptions]
  );

  const { run: handleSearch } = useDebounceFn(
    (value: string) => {
      if (!props.enableSearch) return;

      setSearchQuery(value);
      const _isShowMinCharsHint =
        value?.length > 0 && value?.length < MIN_SEARCH_CHARS;
      setShowMinCharsHint(_isShowMinCharsHint);

      if (!_isShowMinCharsHint) {
        fetchOptions(1, false, value);
      }
    },
    { wait: 500 }
  );

  const getInitValue = useCallback(() => {
    if (fieldValue !== null || uploadedFieldValue) return;

    let _initFieldValue: string | string[] | null = null;

    if (props.value === undefined) {
      setValue(null);
    } else {
      setValue(props.value);

      if (props.multiple) {
        if (Array.isArray(props.value)) {
          _initFieldValue = props.value
            .filter(item => item && typeof item === 'object' && props.bindLabel in item)
            .map((item) => (item as any)[props.bindLabel]);
        }
      } else {
        if (Array.isArray(props.value)) {
          if (props.value.length > 0 && props.value[0] && typeof props.value[0] === 'object' && props.bindLabel in props.value[0]) {
            _initFieldValue = (props.value[0] as any)[props.bindLabel];
          }
        } else if (props.value && typeof props.value === 'object' && props.bindLabel in props.value) {
          _initFieldValue = (props.value as any)[props.bindLabel];
        }
      }
    }

    if (_initFieldValue !== null) {
      setUploadedFieldValue(true);
    }
    setFieldValue(_initFieldValue);
  }, [fieldValue, props.bindLabel, props.multiple, props.value, uploadedFieldValue]);

  useEffect(() => {
    getInitValue();
  }, [getInitValue]);

  const onValueChange = useCallback((_: string, option: any) => {
    if (!uploadedFieldValue) {
      setUploadedFieldValue(true);
    }

    let currentValue: T | T[] | null = null;
    let currentFieldValue: string | string[] | null = null;

    if (Array.isArray(option)) {
      const validOptions = option.filter(it => it?.obj);
      if (validOptions.length > 0) {
        currentValue = validOptions.map(it => it.obj);
        currentFieldValue = validOptions.map(it => it.obj && typeof it.obj === 'object' && props.bindLabel in it.obj
          ? (it.obj as any)[props.bindLabel]
          : '');
      }
    } else {
      if (option?.obj) {
        currentValue = option.obj;
        currentFieldValue = option.obj && typeof option.obj === 'object' && props.bindLabel in option.obj
          ? (option.obj as any)[props.bindLabel]
          : '';
      }
    }

    setFieldValue(currentFieldValue);
    props.onChange(props.formField, currentValue);

    // Очищаем поиск после выбора
    if (searchQuery?.length) {
      setSearchQuery('');
      fetchOptions(1, false, '');
    }
  }, [uploadedFieldValue, props, searchQuery, fetchOptions]);

  const onInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNewTextValue(event.target.value);
  }, []);

  const onTextareaChange = useCallback(() => {
    const text = textAreaRef.current?.resizableTextArea?.textArea.value || '';
    setNewTextValue(text);
  }, []);

  const addOwnValue = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();

    if (!newTextValue.trim() || !props.fieldService) return;

    const currentValues: string[] = [];
    if (Array.isArray(value)) {
      const _currentValues = value
        .filter(item => item && typeof item === 'object' && props.bindLabel in item)
        .map((item: any) => item[props.bindLabel]);
      currentValues.push(..._currentValues);
    } else if (value && typeof value === 'object' && props.bindLabel in value) {
      currentValues.push((value as any)[props.bindLabel]);
    }

    if (!currentValues.includes(newTextValue.trim())) {
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
  }, [newTextValue, props.fieldService, props.bindLabel, props.saveOwnValue, value, options]);

  const onDropdownVisibleChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
    if (open && !options) {
      fetchOptions(1);
    }
  }, [options, fetchOptions]);

  const renderLoadMoreButton = useCallback(() => {
    if (!hasMoreOptions) return null;

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
  }, [hasMoreOptions, fetchOptions, currentPage, isLoading]);

  const renderDropdownContent = useCallback((menu: React.ReactNode) => {
    if (isDropdownOpen && isLoading && !options) {
      return (
        <div className="custom-select-loading">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="custom-select-dropdown-content">
        <div className="custom-select-menu">
          {props.enableSearch && showMinCharsHint ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`Введите минимум ${MIN_SEARCH_CHARS} символа для поиска`}
              style={{ padding: '20px 0' }}
            />
          ) : (
            menu
          )}
        </div>
        {renderLoadMoreButton()}
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
  }, [
    isDropdownOpen,
    isLoading,
    options,
    props.enableSearch,
    props.addOwnValue,
    props.ownFieldTextarea,
    props.ownValuePlaceholder,
    props.ownValueMaxLength,
    showMinCharsHint,
    renderLoadMoreButton,
    onTextareaChange,
    onInputChange,
    newTextValue,
    addOwnValue,
  ]);

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
        notFoundContent={isLoading ? <Spin size="small" /> : null}
      />
    </ConfigProvider>
  );
}