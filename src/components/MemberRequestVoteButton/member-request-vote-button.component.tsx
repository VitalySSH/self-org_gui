import {Button, Checkbox, Form, message, Modal} from "antd";
import { useEffect, useState } from "react";
import { SimpleVoting } from "../../interfaces";
import { CrudDataSourceService } from "../../services";
import { RequestMemberModel, StatusModel } from "../../models";


export function MemberRequestVoteButton(props: any) {

    const tableRow = props.tableRow;
    const modalTitle = `${tableRow?.member} с нами?`;
    const [messageApi, contextHolder] =
        message.useMessage();
    const [modalOpen, setModalOpen] =
        useState(false);
    const [loadFormData, setLoadFormData] =
        useState(false);
    const [vote, setVote] =
        useState(tableRow.vote as boolean | undefined);
    const [disabled, setDisabled] =
        useState(true);
    const [form] = Form.useForm();

    const successInfo = (content: string) => {
        messageApi.open({
            type: 'success',
            content: content,
        }).then();
    };

    const errorInfo = (content: string) => {
        messageApi.open({
            type: 'error',
            content: content,
        }).then();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const updateForm = () => {
        if (!loadFormData) {
            if (vote === undefined) {
                form.setFieldValue('yes', false);
                form.setFieldValue('no', false);
            } else if (vote) {
                form.setFieldValue('yes', true);
                form.setFieldValue('no', false);
            } else {
                form.setFieldValue('yes', false);
                form.setFieldValue('no', true);
            }
            setLoadFormData(true);
        }
    }

    useEffect(() => {
        updateForm();
    }, [updateForm, loadFormData, vote]);

    const handleCancel = () => {
        setModalOpen(false);
        setDisabled(true);
    };

    const toVote = () => {
        setModalOpen(true);
    }

    const onFinish = (formData: SimpleVoting ) => {
        const statusService =
            new CrudDataSourceService(StatusModel);
        const requestMemberService =
            new CrudDataSourceService(RequestMemberModel);
        statusService.list(
            [
                {
                    field: 'code',
                    op: 'equals',
                    val: 'voted',
                }
            ]
        ).then((statuses) => {
            const status =
                statuses.length ? statuses[0] : undefined;
            const requestMember = new RequestMemberModel();
            requestMember.id = tableRow.key;
            if (status) {
                requestMember.status = status;
            }
            requestMember.vote = formData.yes;
            requestMemberService.save(requestMember)
                .then(r => {
                setVote(r.vote);
                successInfo('Голос отдан');
                setModalOpen(false);
            }).catch((error) => {
                    errorInfo(`Ошибка сохранения запроса: ${error}`);
                });
        }).catch((error) => {
            errorInfo(`Ошибка получения статусов: ${error}`);
        });

    }

    const onValuesChange = (formData: SimpleVoting ) => {
        if (formData.yes !== undefined) {
            if (formData.yes && form.getFieldValue('no')) {
                form.setFieldValue('no', false);
            }
        }
        if (formData.no !== undefined) {
            if (formData.no && form.getFieldValue('yes')) {
                form.setFieldValue('yes', false);
            }
        }
        if (disabled) {
            setDisabled(false);
        }
    }

    return (
        <>
            {contextHolder}
            <Modal
                forceRender
                open={modalOpen}
                title={modalTitle}
                onCancel={handleCancel}
                footer={[]}
            >
                <Form
                    name='vote-member-request'
                    form={form}
                    onFinish={onFinish}
                    onValuesChange={onValuesChange}
                >
                    <br/>
                    <Form.Item
                        name='yes'
                        valuePropName='checked'
                        noStyle
                    >
                        <Checkbox >Да</Checkbox>
                    </Form.Item>
                    <Form.Item
                        name='no'
                        valuePropName='checked'
                        noStyle
                    >
                        <Checkbox>Нет</Checkbox>
                    </Form.Item>
                    <Form.Item
                        style={{
                            marginTop: 30
                        }}
                    >
                        <Button
                            type='primary'
                            htmlType='submit'
                            disabled={disabled}
                            block
                        >
                            Отдать голос
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Button
                disabled={!tableRow.isMyRequest}
                onClick={toVote}
            >
                Проголосовать
            </Button>
        </>
    );
}
