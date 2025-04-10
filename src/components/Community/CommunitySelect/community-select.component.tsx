import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
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
import { components } from 'react-select';

export function CommunitySelect(props: CommunitySelectProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [values, setValues] = useState(
    null as UserCommunitySettingsModel[] | null
  );
  const [options, setOptions] = useState(
    undefined as UserCommunitySettingsModel[] | undefined
  );
  const [disabled, setDisabled] = useState(true);

  const [form] = Form.useForm();

  const formatOptionLabel = (option: UserCommunitySettingsModel) => (
    <div>
      <div style={{ fontSize: 14 }}>{option.name?.name}</div>
      <div style={{ fontSize: 12, color: '#888' }}>
        {option.description?.value}
      </div>
    </div>
  );

  const handleAddCommunitySettings = () => {
    const formData: any = form.getFieldsValue();
    const name = new CommunityNameModel();
    name.name = formData.name;
    const desc = new CommunityDescriptionModel();
    desc.value = formData.description;
    const categories: CategoryModel[] = [];
    (formData.categories || []).forEach((it: { name: string }) => {
      if (it?.name) {
        const category = new CategoryModel();
        category.name = it.name;
        categories.push(category);
      }
    });
    const newSettings = new UserCommunitySettingsModel();
    newSettings.names = [name];
    newSettings.descriptions = [desc];
    if (categories.length) {
      newSettings.categories = categories;
    }
    newSettings.quorum = formData.quorum;
    newSettings.vote = formData.vote;
    newSettings.significant_minority = formData.significant_minority;
    newSettings.is_secret_ballot = formData.is_secret_ballot;
    newSettings.is_can_offer = formData.is_can_offer;
    newSettings.is_minority_not_participate =
      formData.is_minority_not_participate;
    newSettings.is_not_delegate = formData.is_not_delegate;
    newSettings.is_default_add_member = formData.is_default_add_member;
    const newValues = values ? [...values, newSettings] : [newSettings];
    setValues(newValues);
    props.onChange(newValues);
    setIsModalVisible(false);
    // form.resetFields();
  };

  const handleClick = () => {
    form.setFieldValue('quorum', props.parentSettings?.quorum);
    form.setFieldValue('vote', props.parentSettings?.vote);
    form.setFieldValue(
      'significant_minority',
      props.parentSettings?.significant_minority
    );
    form.setFieldValue(
      'decision_delay',
      props.parentSettings?.decision_delay
    );
    form.setFieldValue(
      'dispute_time_limit',
      props.parentSettings?.dispute_time_limit
    );
    form.setFieldValue(
      'is_secret_ballot',
      props.parentSettings?.is_secret_ballot || false
    );
    form.setFieldValue(
      'is_can_offer',
      props.parentSettings?.is_can_offer || false
    );
    form.setFieldValue(
      'is_minority_not_participate',
      props.parentSettings?.is_minority_not_participate || false
    );
    form.setFieldValue(
      'is_default_add_member',
      props.parentSettings?.is_default_add_member || false
    );
    form.setFieldValue(
      'is_not_delegate',
      props.parentSettings?.is_not_delegate || false
    );
    setIsModalVisible(true);
  };

  const getOptions = useCallback(() => {
    if (options === undefined) {
      if (props.readonly) {
        setOptions([]);
      } else {
        const userSettingsService = new CrudDataSourceService(
          UserCommunitySettingsModel
        );
        userSettingsService
          .list(
            [
              {
                field: 'parent_community_id',
                op: 'equals',
                val: props.parentCommunityId,
              },
            ],
            undefined,
            undefined,
            ['names', 'descriptions']
          )
          .then((r) => {
            setOptions(r.data);
          });
      }
    }
  }, [options, props.parentCommunityId, props.readonly]);

  const getCurrentValues = useCallback(() => {
    if (values === null && props.values !== undefined) {
      setValues(props.values);
    }
  }, [props.values, values]);

  useEffect(() => {
    getOptions();
    getCurrentValues();
  }, [getCurrentValues, getOptions]);

  const MenuList = (props: any) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: 100, maxHeight: 200, overflowY: 'auto' }}>
          <components.MenuList {...props}>{props.children}</components.MenuList>
        </div>
        <Button
          type="primary"
          onClick={handleClick}
          style={{ margin: 8, maxWidth: 200, left: 0 }}
        >
          Добавить сообщество
        </Button>
      </div>
    );
  };

  return (
    <div>
      <Select
        // TODO: настроить собственные стили и отключить дефолтные
        // unstyled
        // className="react-select"
        // classNamePrefix="react-select"
        isMulti
        isSearchable
        menuPlacement="auto"
        menuPosition="fixed"
        options={options}
        value={values}
        onChange={(selected) => {
          const _values = selected as UserCommunitySettingsModel[];
          props.onChange(_values);
          setValues(_values);
        }}
        getOptionLabel={(e) => `${e.name} - ${e.description}`}
        getOptionValue={(e) => e.id}
        formatOptionLabel={formatOptionLabel}
        placeholder="Выбирите или добавте свои сообщества"
        noOptionsMessage={() => 'Сообщества не найдены'}
        components={{ MenuList }}
      />

      <Modal
        title="Новое внутреннее сообщество"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
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
      >
        <NewCommunityForm form={form} setDisabledButton={setDisabled} />
      </Modal>
    </div>
  );
}
