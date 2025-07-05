import { Col, Form, Input, InputNumber, Row, Select, Spin, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { CrudDataSourceService } from 'src/services';
import { CommunityModel } from 'src/models';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CategoriesLabel,
  DecisionDelayLabel,
  DisputeTimeLimitLabel,
  IsMinorityNotParticipateLabel,
  IsSecretBallotLabel,
  QuorumLabel,
  ResponsibilitiesLabel,
  SignificantMinorityLabel,
  VoteLabel,
} from 'src/consts';

export function CommunitySettings(props: any) {
  const navigate = useNavigate();
  const [settingsLoading, setSettingsLoading] = useState(true);
  const communityService = new CrudDataSourceService(CommunityModel);

  const communityId = props?.communityId;
  const [form] = Form.useForm();

  const getCommunitySettings = useCallback(() => {
    if (settingsLoading && communityId) {
      communityService
        .get(communityId, [
          'creator',
          'main_settings.name',
          'main_settings.description',
          'main_settings.categories',
          'main_settings.responsibilities',
        ])
        .then((community) => {
          const settingsInst = community.main_settings;
          const categories = (settingsInst?.categories || []).map(
            (category) => category.name
          );
          const responsibilities = (settingsInst?.responsibilities || []).map(
            (responsibility) => responsibility.name
          );
          form.setFieldsValue({
            name: settingsInst?.name?.name,
            description: settingsInst?.description?.value,
            quorum: settingsInst?.quorum,
            vote: settingsInst?.vote,
            significant_minority: settingsInst?.significant_minority,
            decision_delay: settingsInst?.decision_delay,
            dispute_time_limit: settingsInst?.dispute_time_limit,
            is_secret_ballot: settingsInst?.is_secret_ballot || false,
            is_can_offer: settingsInst?.is_can_offer || false,
            is_minority_not_participate:
              settingsInst?.is_minority_not_participate || false,
            categories: categories,
            responsibilities: responsibilities,
            creator: community?.creator?.fullname,
          });
        })
        .catch(() => {
          navigate('/no-much-page');
        })
        .finally(() => {
          setSettingsLoading(false);
        });
    } else {
      if (settingsLoading) {
        setSettingsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    getCommunitySettings();
  }, [getCommunitySettings]);

  return (
    <Spin tip="Загрузка данных" size="large" spinning={settingsLoading}>
      <Form name="community-settings" form={form}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
            <Form.Item name="name" label="Наименование" labelCol={{ span: 24 }}>
              <Input readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
            <Form.Item
              name="description"
              label="Описание"
              labelCol={{ span: 24 }}
            >
              <TextArea readOnly rows={2} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="quorum"
              label={QuorumLabel}
              labelCol={{ span: 24 }}
            >
              <InputNumber type="number" style={{ width: 50 }} readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item name="vote" label={VoteLabel} labelCol={{ span: 24 }}>
              <InputNumber type="number" style={{ width: 50 }} readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="significant_minority"
              label={SignificantMinorityLabel}
              labelCol={{ span: 24 }}
            >
              <InputNumber type="number" style={{ width: 50 }} readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="decision_delay"
              label={DecisionDelayLabel}
              labelCol={{ span: 24 }}
            >
              <InputNumber type="number" style={{ width: 50 }} readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="dispute_time_limit"
              label={DisputeTimeLimitLabel}
              labelCol={{ span: 24 }}
            >
              <InputNumber type="number" style={{ width: 50 }} readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="is_secret_ballot"
              label={IsSecretBallotLabel}
              labelCol={{ span: 24 }}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="is_can_offer"
              label="Оказываем услуги другим сообществам"
              labelCol={{ span: 24 }}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <Form.Item
              name="is_minority_not_participate"
              label={IsMinorityNotParticipateLabel}
              labelCol={{ span: 24 }}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
            <Form.Item
              name="categories"
              label={CategoriesLabel}
              labelCol={{ span: 24 }}
            >
              <Select
                mode="multiple"
                suffixIcon={null}
                open={false}
                removeIcon={null}
              ></Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
            <Form.Item
              name="responsibilities"
              label={ResponsibilitiesLabel}
              labelCol={{ span: 24 }}
            >
              <Select
                mode="multiple"
                suffixIcon={null}
                open={false}
                removeIcon={null}
              ></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
            <Form.Item
              name="creator"
              label="Инициатор создания сообщества"
              labelCol={{ span: 24 }}
            >
              <Input readOnly />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
}
