import { Checkbox, Form, Input, Layout, Space, Typography } from "antd";
import TextArea from "antd/lib/input/TextArea";

export function CommunitySettings(props: any) {

    const settings = props.community?.main_settings;

    return (
        <Layout>
            <Typography.Title
                level={4}
                style={{ marginLeft: 20 }}
            >Общие настройки сообщества</Typography.Title>
            <Space
                style={{ marginTop: 30 }}
            >
                <Form
                    name='community-settings'
                    initialValues={{
                        name: settings?.name?.name || '',
                        description: settings?.description?.value || '',
                        quorum: settings?.quorum,
                        vote: settings?.vote,
                    }}
                >
                    <Form.Item
                        name='name'
                        label='Наименование'
                        labelCol={{ span: 24 }}
                    >
                        <Input readOnly />
                    </Form.Item>
                    <Form.Item
                        name='description'
                        label='Описание'
                        labelCol={{ span: 24 }}
                    >
                        <TextArea readOnly rows={5} />
                    </Form.Item>
                    <Form.Item
                        name='quorum'
                        label='Кворум'
                        labelCol={{ span: 24 }}
                    >
                        <Input type="number" readOnly />
                    </Form.Item>
                    <Form.Item
                        name='vote'
                        label='Принятие решения'
                        labelCol={{ span: 24 }}
                    >
                        <Input type="number" readOnly />
                    </Form.Item>
                    <Form.Item
                        name='is_secret_ballot'
                        label='Тайное голосавание?'
                        labelCol={{ span: 24 }}
                    >
                        <Checkbox checked={settings?.is_secret_ballot || false} />
                    </Form.Item>
                    <Form.Item
                        name='is_can_offer'
                        label='Оказываем услуги другим сообществам?'
                        labelCol={{ span: 24 }}
                    >
                        <Checkbox checked={settings?.is_can_offer || false} />
                    </Form.Item>
                    <Form.Item
                        name='is_minority_not_participate'
                        label='Меньшинство обязано подчиниться большинству?'
                        labelCol={{ span: 24 }}
                    >
                        <Checkbox checked={settings?.is_minority_not_participate || false} />
                    </Form.Item>
                </Form>
            </Space>
        </Layout>
    );
}

