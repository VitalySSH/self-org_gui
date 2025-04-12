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
import './community-select.component.scss';

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

  const communityName = (settings: UserCommunitySettingsModel) => {
    if (settings.community) {
      return settings.community.main_settings?.name?.name;
    } else if (settings.names?.length) {
      return settings.names[0].name;
    } else {
      return '';
    }
  };

  const communityDescription = (settings: UserCommunitySettingsModel) => {
    if (settings.community) {
      return settings.community.main_settings?.description?.value;
    } else if (settings.descriptions?.length) {
      return settings.descriptions[0].value;
    } else {
      return '';
    }
  };

  const formatOptionLabel = (option: UserCommunitySettingsModel) => (
    <div>
      <div style={{ fontSize: 14 }}>{communityName(option)}</div>
      <div style={{ fontSize: 12, color: '#888' }}>
        {communityDescription(option)}
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
    newSettings.decision_delay = formData.decision_delay;
    newSettings.dispute_time_limit = formData.dispute_time_limit;
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
    form.setFieldsValue({
      quorum: props.parentSettings?.quorum,
      vote: props.parentSettings?.vote,
      significant_minority: props.parentSettings?.significant_minority,
      decision_delay: props.parentSettings?.decision_delay,
      dispute_time_limit: props.parentSettings?.dispute_time_limit,
      is_secret_ballot: props.parentSettings?.is_secret_ballot || false,
      is_can_offer: props.parentSettings?.is_can_offer || false,
      is_minority_not_participate:
        props.parentSettings?.is_minority_not_participate || false,
      is_default_add_member:
        props.parentSettings?.is_default_add_member || false,
      is_not_delegate: props.parentSettings?.is_not_delegate || false,
    });
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
            ['names', 'descriptions',
              'community.main_settings.names',
              'community.main_settings.descriptions',
            ]
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
        getOptionLabel={(e) =>
          `${communityName(e)} - ${communityDescription(e)}`
        }
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
        centered
      >
        <NewCommunityForm form={form} setDisabledButton={setDisabled} />
      </Modal>
    </div>
  );
}
