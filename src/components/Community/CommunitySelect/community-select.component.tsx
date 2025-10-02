import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Select, Modal, Form, Button, ConfigProvider, Empty } from 'antd';
import {
  CategoryModel,
  CommunityDescriptionModel,
  CommunityNameModel,
  UserCommunitySettingsModel,
} from 'src/models';
import { CrudDataSourceService } from 'src/services';
import { CommunitySelectProps } from 'src/interfaces';
import { NewCommunityForm } from 'src/components';
import './community-select.component.scss';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

export function CommunitySelect(props: CommunitySelectProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [values, setValues] = useState<UserCommunitySettingsModel[] | null>(
    null
  );
  const [options, setOptions] = useState<
    UserCommunitySettingsModel[] | undefined
  >(undefined);
  const [disabled, setDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ИСПРАВЛЕНИЕ: добавляем ref для Select компонента
  const selectRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [form] = Form.useForm();

  // Простое определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Безопасное получение имени сообщества
  const communityName = useCallback(
    (settings: UserCommunitySettingsModel): string => {
      try {
        if (settings?.community?.main_settings?.name?.name) {
          return settings.community.main_settings.name.name;
        }
        if (settings?.names?.length && settings.names[0]?.name) {
          return settings.names[0].name;
        }
        return 'Без названия';
      } catch (error) {
        console.warn('Error getting community name:', error);
        return 'Без названия';
      }
    },
    []
  );

  // Безопасное получение описания сообщества
  const communityDescription = useCallback(
    (settings: UserCommunitySettingsModel): string => {
      try {
        if (settings?.community?.main_settings?.description?.value) {
          return settings.community.main_settings.description.value;
        }
        if (settings?.descriptions?.length && settings.descriptions[0]?.value) {
          return settings.descriptions[0].value;
        }
        return 'Без описания';
      } catch (error) {
        console.warn('Error getting community description:', error);
        return 'Без описания';
      }
    },
    []
  );

  // Мемоизированные опции для Ant Design Select
  const selectOptions = useMemo(() => {
    if (!options) return [];

    return options.map((setting, index) => {
      const name = communityName(setting);
      const description = communityDescription(setting);
      // ИСПРАВЛЕНИЕ: используем индекс как уникальный идентификатор
      const optionValue = setting.id || `index_${index}`;

      return {
        value: optionValue,
        label: name, // Простой текст для основного отображения
        title: `${name} - ${description}`, // Tooltip с полным описанием
        data: setting,
        index: index, // Сохраняем индекс для поиска
        // Кастомный рендер для dropdown
        customLabel: (
          <div className="community-option">
            <div className="community-option-name">{name}</div>
            <div className="community-option-description">{description}</div>
          </div>
        ),
      };
    });
  }, [options, communityName, communityDescription]);

  // Мемоизированные выбранные значения
  const selectedValues = useMemo(() => {
    if (!values || !selectOptions) return [];

    return values
      .map((value) => {
        const matchingOption = selectOptions.find(
          (option) =>
            // Сравниваем объекты или их содержимое
            option.data === value ||
            (option.data.names?.[0]?.name === value.names?.[0]?.name &&
              option.data.descriptions?.[0]?.value ===
                value.descriptions?.[0]?.value)
        );
        return matchingOption?.value;
      })
      .filter(Boolean); // Убираем undefined значения
  }, [values, selectOptions]);

  // Обработчик закрытия dropdown для мобильных
  const handleMobileClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
  }, []);

  // Обработчик добавления настроек сообщества
  const handleAddCommunitySettings = useCallback(async () => {
    try {
      const formData = form.getFieldsValue();

      // Валидация обязательных полей
      if (!formData.name?.trim()) {
        form.setFields([
          {
            name: 'name',
            errors: ['Название сообщества обязательно'],
          },
        ]);
        return;
      }

      const name = new CommunityNameModel();
      name.name = formData.name.trim();

      const desc = new CommunityDescriptionModel();
      desc.value = formData.description?.trim() || '';

      const categories: CategoryModel[] = [];
      if (formData.categories?.length) {
        formData.categories.forEach((categoryData: { name: string }) => {
          if (categoryData?.name?.trim()) {
            const category = new CategoryModel();
            category.name = categoryData.name.trim();
            categories.push(category);
          }
        });
      }

      const newSettings = new UserCommunitySettingsModel();
      newSettings.names = [name];
      newSettings.descriptions = [desc];

      if (categories.length) {
        newSettings.categories = categories;
      }

      // Копируем настройки с валидацией
      newSettings.quorum = formData.quorum || 0;
      newSettings.vote = formData.vote || 0;
      newSettings.significant_minority = formData.significant_minority || 0;
      newSettings.decision_delay = formData.decision_delay || 0;
      newSettings.dispute_time_limit = formData.dispute_time_limit || 0;
      newSettings.is_secret_ballot = Boolean(formData.is_secret_ballot);
      newSettings.is_can_offer = Boolean(formData.is_can_offer);
      newSettings.is_minority_not_participate = Boolean(
        formData.is_minority_not_participate
      );
      newSettings.is_not_delegate = Boolean(formData.is_not_delegate);
      newSettings.is_default_add_member = Boolean(
        formData.is_default_add_member
      );
      const updatedOptions = options
        ? [...options, newSettings]
        : [newSettings];
      setOptions(updatedOptions);

      const newValues = values ? [...values, newSettings] : [newSettings];
      setValues(newValues);
      props.onChange(newValues);

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding community settings:', error);
    }
  }, [form, values, props, options]);

  // Простой обработчик открытия модального окна
  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Закрываем dropdown
    setIsDropdownOpen(false);

    // Открываем модальное окно
    setIsModalVisible(true);
  }, []);

  // Обработчик события после открытия модального окна
  const handleAfterOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        // Устанавливаем значения формы только после открытия модального окна
        setTimeout(() => {
          form.setFieldsValue({
            quorum: props.parentSettings?.quorum || 50,
            vote: props.parentSettings?.vote || 50,
            significant_minority:
              props.parentSettings?.significant_minority || 25,
            decision_delay: props.parentSettings?.decision_delay || 0,
            dispute_time_limit: props.parentSettings?.dispute_time_limit || 0,
            is_secret_ballot: props.parentSettings?.is_secret_ballot || false,
            is_can_offer: props.parentSettings?.is_can_offer || false,
            is_minority_not_participate:
              props.parentSettings?.is_minority_not_participate || false,
            is_default_add_member:
              props.parentSettings?.is_default_add_member || false,
            is_not_delegate: props.parentSettings?.is_not_delegate || false,
          });
        }, 0);
      }
    },
    [form, props.parentSettings]
  );

  // Получение опций
  const getOptions = useCallback(async () => {
    if (options !== undefined) return;

    if (props.readonly) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const userSettingsService = new CrudDataSourceService(
        UserCommunitySettingsModel
      );
      const response = await userSettingsService.list(
        [
          {
            field: 'parent_community_id',
            op: 'equals',
            val: props.parentCommunityId,
          },
        ],
        undefined,
        undefined,
        [
          'names',
          'descriptions',
          'community.main_settings.names',
          'community.main_settings.descriptions',
        ]
      );
      setOptions(response.data || []);
    } catch (error) {
      console.error('Error fetching community options:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [options, props.parentCommunityId, props.readonly]);

  // Получение текущих значений
  const getCurrentValues = useCallback(() => {
    if (values === null && props.values !== undefined) {
      setValues(props.values);
    }
  }, [props.values, values]);

  useEffect(() => {
    getOptions();
    getCurrentValues();
  }, [getOptions, getCurrentValues]);

  // Обработчик изменения выбранных значений
  const handleSelectChange = useCallback(
    (selectedIds: string[]) => {
      if (!selectOptions) return;

      // ИСПРАВЛЕНИЕ: находим объекты по выбранным id
      const selectedSettings = selectedIds
        .map((id) => selectOptions.find((option) => option.value === id)?.data)
        .filter(Boolean); // Убираем undefined значения

      // @ts-ignore
      setValues(selectedSettings);
      props.onChange(selectedSettings);
    },
    [selectOptions, props]
  );

  // Обработчик открытия/закрытия dropdown
  const handleDropdownVisibleChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open);
      if (open && !options) {
        getOptions();
      }
    },
    [options, getOptions]
  );

  // Кастомный рендер dropdown содержимого (аналогично CustomSelect)
  const renderDropdownContent = useCallback(
    (menu: React.ReactNode) => {
      return (
        <div className="community-select-dropdown-content">
          {/* Кнопка закрытия только для мобильных */}
          {isMobile && (
            <div className="mobile-close-button">
              <span className="close-button-title">Выберите сообщества</span>
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

          <div className="community-select-menu">{menu}</div>

          {!props.readonly && (
            <div className="add-community-container">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenModal}
                size="small"
                className="custom-add-button"
                style={{ width: 'auto', minWidth: '120px' }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                Добавить сообщество
              </Button>
            </div>
          )}
        </div>
      );
    },
    [isMobile, props.readonly, handleMobileClose, handleOpenModal]
  );

  // Кастомный рендер пустого состояния
  const emptyRender = useCallback(() => {
    if (isLoading && !options) return null;
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Сообщества не найдены"
        style={{ padding: '20px 0' }}
      />
    );
  }, [isLoading, options]);

  return (
    <div className="community-select-wrapper" ref={containerRef}>
      <ConfigProvider renderEmpty={emptyRender}>
        <Select
          ref={selectRef}
          mode="multiple"
          showSearch
          filterOption={false}
          /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
          // @ts-expect-error
          value={selectedValues}
          onChange={handleSelectChange}
          onDropdownVisibleChange={handleDropdownVisibleChange}
          dropdownRender={renderDropdownContent}
          options={selectOptions}
          placeholder="Выберите или добавьте свои сообщества"
          loading={isLoading}
          disabled={props.readonly}
          allowClear
          style={{ width: '100%' }}
          popupClassName="community-select-dropdown"
          open={isDropdownOpen}
          optionRender={(option) => option.data?.customLabel || option.label}
          getPopupContainer={
            isMobile
              ? () => document.body
              : () => containerRef.current || document.body
          }
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

      <Modal
        title="Новое внутреннее сообщество"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        afterOpenChange={handleAfterOpenChange}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Отмена
          </Button>,
          <Button
            key="add-button"
            type="primary"
            disabled={disabled}
            onClick={handleAddCommunitySettings}
          >
            Добавить
          </Button>,
        ]}
        styles={{
          content: {
            maxHeight: '90vh',
          },
          body: {
            overflowY: 'auto',
            height: 'calc(90vh - 108px)',
            padding: '16px 24px',
          },
        }}
        width={isMobile ? '100%' : '60%'}
        className="custom-modal"
        centered
        destroyOnHidden
        getContainer={() => containerRef.current || document.body}
      >
        <div className="new-community-form in-modal">
          <NewCommunityForm form={form} setDisabledButton={setDisabled} />
        </div>
      </Modal>
    </div>
  );
}
