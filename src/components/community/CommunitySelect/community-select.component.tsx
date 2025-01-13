import { useEffect, useState } from "react";
import Select from "react-select/creatable";
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
            <strong>{option.name?.name}</strong>
            <div
                style={{ fontSize: "12px", color: "#888" }}
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    setOptions(r);
                });
            }
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCurrentValues = () => {
        if (values === null && props.values !== undefined) {
            setValues(props.values);
        }
    }

    useEffect(() => {
        getOptions();
        getCurrentValues();
    }, [
        options, props, userSettingsService,
        userSettingsService, getOptions, getCurrentValues
    ]);

    return (
        <div>
            <Select
                isMulti
                options={options}
                value={values}
                onChange={
                    (selected) => props.onChange(
                        selected as UserCommunitySettingsModel[])
                }
                getOptionLabel={(e) => `${e.name} - ${e.description}`}
                getOptionValue={(e) => e.id}
                formatOptionLabel={formatOptionLabel}
                placeholder="Выбирите или добавте свои сообщества"
                noOptionsMessage={() => "Сообщества не найдены"}
            />
            <Button
                type="primary"
                onClick={handleClick}
                style={{ marginTop: 12 }}
            >
                Добавить сообщество
            </Button>

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