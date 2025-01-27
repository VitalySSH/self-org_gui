import { useEffect, useState } from "react";
import Select from 'react-select';
import {
    Modal,
    Form,
    Button,
} from "antd";
import {
    CategoryModel,
    CommunityDescriptionModel,
    CommunityNameModel,
    UserCommunitySettingsModel
} from "src/models";
import { CrudDataSourceService } from "src/services";
import { CommunitySelectProps } from "src/interfaces";
import { NewCommunityForm } from "src/components";
import { components } from "react-select";


export function CommunitySelect(props: CommunitySelectProps) {
    const [
        isModalVisible,
        setIsModalVisible
    ] = useState(false);
    const [values, setValues] =
        useState(null as UserCommunitySettingsModel[] | null);
    const [
        options,
        setOptions
    ] = useState(undefined as UserCommunitySettingsModel[] | undefined);
    const [disabled, setDisabled] =
        useState(true);

    const [form] = Form.useForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const userSettingsService =
        new CrudDataSourceService(UserCommunitySettingsModel);

    const formatOptionLabel = (option: UserCommunitySettingsModel) => (
        <div>
            <div
                style={{ fontSize: 14 }}
            >
                {option.name?.name}
            </div>
            <div
                style={{ fontSize: 12, color: "#888" }}
            >
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
        (formData.categories || [])
            .forEach((it: { name: string }) => {
                const category = new CategoryModel();
                category.name = it.name;
                categories.push(category);
        });
        const newSettings =
            new UserCommunitySettingsModel();
        newSettings.name = name;
        newSettings.description = desc;
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
        const newValues =
            values ? [...values, newSettings] : [newSettings];
        setValues(newValues);
        props.onChange(newValues);
        setIsModalVisible(false);
        // form.resetFields();
    };

    const handleClick = () => {
        setIsModalVisible(true);
    };

    const getOptions = () => {
        if (options === undefined) {
            if (props.readonly) {
                setOptions([]);
            } else {
                userSettingsService.list([
                    {
                        field: 'parent_community_id',
                        op: 'equals',
                        val: props.parentCommunityId,
                    }
                ], undefined, undefined, [
                    'name', 'description'
                ]).then(r => {
                    setOptions(r.data);
                });
            }
        }
    }

    const getCurrentValues = () => {
        if (values === null && props.values !== undefined) {
            setValues(props.values);
        }
    }

    useEffect(() => {
        getOptions();
        getCurrentValues();
    }, [props.values, props.parentCommunityId, props.readonly]);

    const MenuList = (props: any) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <Button
                    type="primary"
                    onClick={handleClick}
                    style={{ margin: 8 }}
                >
                    Добавить сообщество
                </Button>
            </components.MenuList>
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
                options={options}
                value={values}
                onChange={
                    (selected) => {
                        const _values =
                            selected as UserCommunitySettingsModel[];
                        props.onChange(_values);
                        setValues(_values);
                    }
                }
                getOptionLabel={
                    (e) =>
                        `${e.name} - ${e.description}`}
                    getOptionValue={(e) => e.id
                }
                formatOptionLabel={formatOptionLabel}
                placeholder="Выбирите или добавте свои сообщества"
                noOptionsMessage={() => "Сообщества не найдены"}
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
            >
                <NewCommunityForm
                    form={form}
                    setDisabledButton={setDisabled}
                />
            </Modal>
        </div>
    );
}