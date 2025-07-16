import { useCallback, useEffect, useState, useMemo } from 'react';
import Select, { components, MultiValue, SingleValue } from 'react-select';
import { Modal, Form, Button } from 'antd';
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

interface CommunityOption {
  value: string;
  label: string;
  data: UserCommunitySettingsModel;
}

export function CommunitySelect(props: CommunitySelectProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [values, setValues] = useState<UserCommunitySettingsModel[] | null>(null);
  const [options, setOptions] = useState<UserCommunitySettingsModel[] | undefined>(undefined);
  const [disabled, setDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();

  // Безопасное получение имени сообщества
  const communityName = useCallback((settings: UserCommunitySettingsModel): string => {
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
  }, []);

  // Безопасное получение описания сообщества
  const communityDescription = useCallback((settings: UserCommunitySettingsModel): string => {
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
  }, []);

  // Мемоизированные опции для react-select
  const selectOptions = useMemo((): CommunityOption[] => {
    if (!options) return [];

    return options.map((setting) => ({
      value: setting.id || Math.random().toString(36),
      label: `${communityName(setting)} - ${communityDescription(setting)}`,
      data: setting,
    }));
  }, [options, communityName, communityDescription]);

  // Мемоизированные выбранные значения
  const selectedValues = useMemo((): CommunityOption[] => {
    if (!values) return [];

    return values.map((setting) => ({
      value: setting.id || Math.random().toString(36),
      label: `${communityName(setting)} - ${communityDescription(setting)}`,
      data: setting,
    }));
  }, [values, communityName, communityDescription]);

  // Форматирование метки опции
  const formatOptionLabel = useCallback((option: CommunityOption) => (
    <div className="community-option">
      <div className="community-option-name">{communityName(option.data)}</div>
      <div className="community-option-description">{communityDescription(option.data)}</div>
    </div>
  ), [communityName, communityDescription]);

  // Обработчик добавления настроек сообщества
  const handleAddCommunitySettings = useCallback(async () => {
    try {
      const formData = form.getFieldsValue();

      // Валидация обязательных полей
      if (!formData.name?.trim()) {
        form.setFields([{
          name: 'name',
          errors: ['Название сообщества обязательно']
        }]);
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
      newSettings.is_minority_not_participate = Boolean(formData.is_minority_not_participate);
      newSettings.is_not_delegate = Boolean(formData.is_not_delegate);
      newSettings.is_default_add_member = Boolean(formData.is_default_add_member);

      const newValues = values ? [...values, newSettings] : [newSettings];
      setValues(newValues);
      props.onChange(newValues);
      setIsModalVisible(false);

      // Не сбрасываем форму для удобства пользователя
      // form.resetFields();
    } catch (error) {
      console.error('Error adding community settings:', error);
    }
  }, [form, values, props]);

  // Обработчик открытия модального окна
  const handleClick = useCallback(() => {
    // Предзаполнение формы значениями родительских настроек
    form.setFieldsValue({
      quorum: props.parentSettings?.quorum || 50,
      vote: props.parentSettings?.vote || 50,
      significant_minority: props.parentSettings?.significant_minority || 25,
      decision_delay: props.parentSettings?.decision_delay || 0,
      dispute_time_limit: props.parentSettings?.dispute_time_limit || 0,
      is_secret_ballot: props.parentSettings?.is_secret_ballot || false,
      is_can_offer: props.parentSettings?.is_can_offer || false,
      is_minority_not_participate: props.parentSettings?.is_minority_not_participate || false,
      is_default_add_member: props.parentSettings?.is_default_add_member || false,
      is_not_delegate: props.parentSettings?.is_not_delegate || false,
    });
    setIsModalVisible(true);
  }, [form, props.parentSettings]);

  // Получение опций
  const getOptions = useCallback(async () => {
    if (options !== undefined) return;

    if (props.readonly) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const userSettingsService = new CrudDataSourceService(UserCommunitySettingsModel);
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
  const handleSelectChange = useCallback((
    selected: MultiValue<CommunityOption> | SingleValue<CommunityOption>
  ) => {
    const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);
    const _values = selectedArray.map(option => option.data);

    props.onChange(_values);
    setValues(_values);
  }, [props]);

  // Кастомный компонент меню с кнопкой добавления
  const CustomMenuList = useCallback((menuProps: any) => {
    return (
      <div className="community-select-menu">
        <div className="community-select-options">
          <components.MenuList {...menuProps}>
            {menuProps.children}
          </components.MenuList>
        </div>
        {!props.readonly && (
          <div className="community-select-add-button">
            <Button
              type="primary"
              onClick={handleClick}
              block
              size="small"
            >
              Добавить сообщество
            </Button>
          </div>
        )}
      </div>
    );
  }, [props.readonly, handleClick]);

  // Кастомные стили для react-select
  const customStyles = useMemo(() => ({
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '8px',
      border: `1px solid ${state.isFocused ? '#cc0000' : '#e0e0e0'}`,
      boxShadow: state.isFocused ? '0 0 0 2px rgba(204, 0, 0, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#cc0000' : '#b0b0b0',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(204, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      minHeight: '40px',
      fontSize: '14px',
      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#999999',
      fontSize: '14px',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(204, 0, 0, 0.08)',
      border: '1px solid rgba(204, 0, 0, 0.2)',
      borderRadius: '6px',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#cc0000',
      fontSize: '12px',
      padding: '2px 6px',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: 'rgba(204, 0, 0, 0.6)',
      '&:hover': {
        backgroundColor: 'rgba(204, 0, 0, 0.2)',
        color: '#cc0000',
      },
      borderRadius: '0 4px 4px 0',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e0e0e0',
      overflow: 'hidden',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'rgba(204, 0, 0, 0.08)'
        : state.isFocused
          ? 'rgba(204, 0, 0, 0.04)'
          : 'white',
      color: state.isSelected ? '#cc0000' : '#333333',
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      '&:active': {
        backgroundColor: 'rgba(204, 0, 0, 0.06)',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: '#999999',
      fontSize: '14px',
      padding: '16px',
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: '#999999',
      fontSize: '14px',
      padding: '16px',
    }),
  }), []);

  return (
    <div className="community-select-wrapper">
      <Select<CommunityOption, true>
        isMulti
        isSearchable
        isLoading={isLoading}
        menuPlacement="auto"
        menuPosition="fixed"
        options={selectOptions}
        value={selectedValues}
        onChange={handleSelectChange}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        formatOptionLabel={formatOptionLabel}
        placeholder="Выберите или добавьте свои сообщества"
        noOptionsMessage={() => 'Сообщества не найдены'}
        loadingMessage={() => 'Загрузка...'}
        components={{ MenuList: CustomMenuList }}
        styles={customStyles}
        isDisabled={props.readonly}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable={false}
        isRtl={false}
        classNamePrefix="community-select"
      />

      <Modal
        title="Новое внутреннее сообщество"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsModalVisible(false)}
          >
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
        width="60%"
        className="custom-modal"
        centered
        destroyOnClose
      >
        <NewCommunityForm form={form} setDisabledButton={setDisabled} />
      </Modal>
    </div>
  );
}