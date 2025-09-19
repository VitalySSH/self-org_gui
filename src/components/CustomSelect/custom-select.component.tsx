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
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
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

const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;

  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length && i < 5; i++) {
    if (current == null) return undefined;
    current = current[keys[i]];
  }

  return current;
};

const setNestedValue = (obj: any, path: string, value: any): void => {
  if (!obj || !path) return;

  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1 && i < 4; i++) {
    if (current[keys[i]] == null || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  if (keys.length <= 5) {
    current[keys[keys.length - 1]] = value;
  }
};

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
  const [isMobile, setIsMobile] = useState(false);

  const MIN_SEARCH_CHARS = 3;

  // Readonly режим (по умолчанию false)
  const isReadonly = props.readonly || false;

  // Простое определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    [props, searchQuery, options, totalOptions]
  );

  const { run: handleSearch } = useDebounceFn(
    (value: string) => {
      if (!props.enableSearch || isReadonly) return;

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
            .filter((item) => item && typeof item === 'object')
            .map((it) => getNestedValue(it, props.bindLabel))
            .filter((val) => val !== undefined);
        }
      } else {
        if (Array.isArray(props.value)) {
          if (
            props.value.length > 0 &&
            props.value[0] &&
            typeof props.value[0] === 'object'
          ) {
            _initFieldValue = getNestedValue(props.value[0], props.bindLabel);
          }
        } else if (
          props.value !== undefined &&
          props.value &&
          typeof props.value === 'object'
        ) {
          _initFieldValue = getNestedValue(props.value, props.bindLabel);
        }
      }
      if (_initFieldValue !== null && _initFieldValue !== undefined) {
        setUploadedFieldValue(true);
      }
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
    // Не обрабатываем изменения в readonly режиме
    if (isReadonly) return;

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
      currentFieldValue = (currentValue || []).map((it) =>
        getNestedValue(it, props.bindLabel)
      );
    } else {
      if (option?.obj) {
        currentValue = option.obj;
        currentFieldValue = getNestedValue(option.obj, props.bindLabel);
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
    if (isReadonly) return;
    setNewTextValue(event.target.value);
  };

  const onTextareaChange = () => {
    if (isReadonly) return;
    const text = textAreaRef.current?.resizableTextArea?.textArea.value || '';
    setNewTextValue(text);
  };

  const addOwnValue = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isReadonly || !newTextValue.trim()) return;

      const currentValues: string[] = [];
      if (Array.isArray(value)) {
        const _currentValues = value
          .filter((item) => item && typeof item === 'object')
          .map((it: any) => getNestedValue(it, props.bindLabel))
          .filter((val) => val !== undefined);
        currentValues.push(..._currentValues);
      } else if (value !== null && value && typeof value === 'object') {
        const val = getNestedValue(value, props.bindLabel);
        if (val !== undefined) {
          currentValues.push(val);
        }
      }

      if (props.fieldService && !currentValues.includes(newTextValue.trim())) {
        const newObj = props.fieldService.createRecord();
        setNestedValue(newObj, props.bindLabel, newTextValue.trim());
        const currentOptions = options || [];

        if (props.saveOwnValue) {
          props.fieldService
            .save(newObj)
            .then((resp) => {
              setOptions([...currentOptions, resp]);
              setNewTextValue('');
            })
            .catch((error) => {
              console.error(
                'Ошибка создания нового значения в селекторе:',
                error
              );
              setOptions([]);
            });
        } else {
          setOptions([...currentOptions, newObj]);
          setNewTextValue('');
        }
      }
    },
    [newTextValue, value, props, options, isReadonly]
  );

  // Обработчик закрытия dropdown для мобильных
  const handleMobileClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
  }, []);

  const onDropdownVisibleChange = (open: boolean) => {
    // В readonly режиме не открываем dropdown
    if (isReadonly) return;

    setIsDropdownOpen(open);
    if (open && !options) {
      fetchOptions(1);
    }
  };

  const selectOptions = useMemo(() => {
    return (options || []).map((item: T, index: number) => {
      const labelValue =
        item && typeof item === 'object'
          ? getNestedValue(item, props.bindLabel)
          : '';

      const key = item?.id || `temp-${labelValue}-${index}`;

      return {
        key,
        value: labelValue,
        label: labelValue,
        obj: item,
      };
    });
  }, [options, props.bindLabel]);

  const renderLoadMoreButton = () => {
    if (
      isReadonly ||
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
    if (isDropdownOpen && isLoading && !options) {
      return (
        <div className="custom-select-loading">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div
        className={`custom-select-dropdown-content ${isReadonly ? 'readonly-mode' : ''}`}
      >
        {/* Кнопка закрытия только для мобильных */}
        {isMobile && (
          <div className="mobile-close-button">
            <span className="close-button-title">
              {isReadonly ? 'Просмотр значений' : 'Выберите значение'}
            </span>
            <div
              className="close-button"
              onClick={handleMobileClose}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              role="button"
              aria-label="Закрыть список"
            >
              <CloseOutlined />
            </div>
          </div>
        )}

        <div className="custom-select-menu" style={{ maxHeight: 300 }}>
          {props.enableSearch && showMinCharsHint && !isReadonly ? (
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
        {/* Секция добавления скрыта в readonly режиме */}
        {props.addOwnValue && !isReadonly && (
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
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        newTextValue.trim()
                      ) {
                        addOwnValue(e);
                      }
                    }}
                    maxLength={props.ownValueMaxLength}
                    // КРИТИЧНЫЕ НАСТРОЙКИ ДЛЯ МОБИЛЬНЫХ
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    autoComplete="off"
                  />
                ) : (
                  <Input
                    placeholder={props.ownValuePlaceholder}
                    ref={inputRef}
                    onChange={onInputChange}
                    value={newTextValue}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' && newTextValue.trim()) {
                        addOwnValue(e);
                      }
                    }}
                    maxLength={props.ownValueMaxLength}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    autoComplete="off"
                  />
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addOwnValue}
                  disabled={!newTextValue.trim()}
                  size="small"
                  className="custom-add-button"
                  style={{ width: 'auto', minWidth: '80px' }}
                  // КРИТИЧНЫЕ НАСТРОЙКИ ДЛЯ МОБИЛЬНЫХ
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
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
        showSearch={props.enableSearch && !isReadonly}
        onChange={onValueChange}
        onSearch={props.enableSearch && !isReadonly ? handleSearch : undefined}
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
        allowClear={!isReadonly}
        style={{ width: '100%' }}
        popupClassName={`custom-select-dropdown ${isReadonly ? 'readonly-dropdown' : ''}`}
        disabled={isReadonly}
        getPopupContainer={isMobile ? () => document.body : undefined}
        open={isReadonly ? false : isDropdownOpen}
        dropdownStyle={
          isMobile
            ? {
                position: 'fixed',
                zIndex: 9999,
              }
            : undefined
        }
      />
    </ConfigProvider>
  );
}
