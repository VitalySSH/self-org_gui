import {Button, Checkbox, Form, message, Modal} from "antd";
import { useEffect, useState } from "react";
import { SimpleVoting } from "../../interfaces";
import { CrudDataSourceService } from "../../services";
import { RequestMemberModel, StatusModel } from "../../models";


export function MemberRequestVoteButton(props: any) {

    const tableRow = props.tableRow;
    const modalTitle = tableRow ? `${tableRow?.member} с нами?` : '';
    const [messageApi, contextHolder] =
        message.useMessage();
    const [modalOpen, setModalOpen] =
        useState(false);
    const [loadFormData, setLoadFormData] =
        useState(false);
    const [vote, setVote] =
        useState(tableRow?.vote as boolean | undefined);
    const [disabled, setDisabled] =
        useState(true);
    const [voteForm] = Form.useForm();

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
        // FIXME: разобраться, почему заходит сюда дважды
        if (!loadFormData) {
            if (vote === undefined) {
                voteForm.setFieldValue('yes', false);
                voteForm.setFieldValue('no', false);
            } else if (vote) {
                voteForm.setFieldValue('yes', true);
                voteForm.setFieldValue('no', false);
            } else {
                voteForm.setFieldValue('yes', false);
                voteForm.setFieldValue('no', true);
            }
            setLoadFormData(true);
        }
    }

    useEffect(() => {
        updateForm();
    }, [updateForm, setLoadFormData, loadFormData, vote, voteForm]);

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
            requestMember.id = tableRow?.key;
            if (status) {
                requestMember.status = status;
            }
            requestMember.vote = formData.yes;
            requestMemberService.save(requestMember)
                .then(r => {
                setVote(r.vote);
                successInfo('Голос отдан');
                setModalOpen(false);
                setDisabled(true);
            }).catch((error) => {
                    errorInfo(`Ошибка сохранения запроса: ${error}`);
                });
        }).catch((error) => {
            errorInfo(`Ошибка получения статусов: ${error}`);
        });

    }

    const onValuesChange = (formData: SimpleVoting ) => {
        if (formData.yes !== undefined) {
            if (formData.yes && voteForm.getFieldValue('no')) {
                voteForm.setFieldValue('no', false);
            }
        }
        else if (formData.no !== undefined) {
            if (formData.no && voteForm.getFieldValue('yes')) {
                voteForm.setFieldValue('yes', false);
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
                    form={voteForm}
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
                            marginTop: 20
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
                disabled={tableRow?.isMyRequest || false}
                onClick={toVote}
            >
                Проголосовать
            </Button>
        </>
    );
}
