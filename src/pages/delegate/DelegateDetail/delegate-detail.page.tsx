import './delegate-detail.page.scss';
import { Button, Form, message, Select, Spin, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { DelegateSettingsModel } from 'src/models';
import { CustomSelect } from 'src/components';
import { Pagination } from 'src/interfaces';
import { CategoryLabel, DelegateLabel } from 'src/consts';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Filters } from 'src/shared/types.ts';

export function DelegateDetail(props: any) {
  const communityId = props.communityId;
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [delegate, setDelegate] = useState<DelegateSettingsModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const authApiClientService = new AuthApiClientService();

  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = useCallback(
    (content: string) => {
      messageApi
        .open({
          type: 'error',
          content: content,
        })
        .then();
    },
    [messageApi]
  );

  const fetchDelegateSettings = useCallback(() => {
    if (!delegate && id) {
      const delegateService = new CrudDataSourceService(DelegateSettingsModel);
      delegateService
        .get(id, ['category', 'delegate'])
        .then((delegateInst) => {
          setDelegate(delegateInst);
          form.setFieldsValue({
            category: delegateInst.category?.name,
            delegate: delegateInst.delegate,
          });
        })
        .catch((error) => {
          errorInfo(`Не удалось загрузить настройки советника: ${error}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [delegate, id, errorInfo]);

  useEffect(() => {
    fetchDelegateSettings();
  }, [fetchDelegateSettings]);

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
  };

  const handleFormChange = () => {
    setDisabled(!Boolean(form.getFieldValue('delegate')));
  };

  const fetchUsers = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    return authApiClientService.communityListUsers(
      communityId,
      newFilters,
      undefined,
      pagination,
      undefined,
      true
    );
  };

  const onCancel = () => {
    navigate(-1);
  };

  const onFinish = async () => {
    setButtonLoading(true);
    const updatedDelegate = delegate;
    if (updatedDelegate) {
      const delegateService = new CrudDataSourceService(DelegateSettingsModel);
      updatedDelegate.delegate = form.getFieldValue('delegate');
      delegateService.save(updatedDelegate).then(() => {
        successInfo('Советник успешно изменён');
        setButtonLoading(false);
        onCancel();
      });
    } else {
      errorInfo('Советник не выбран');
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading-spinner" aria-live="polite" aria-busy="true">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!delegate) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <div className="form-container">
        <div className="form-header">Замена советника</div>
        <Form
          form={form}
          name="delegate-settings-detail"
          onFieldsChange={handleFormChange}
        >
          <Form.Item
            name="category"
            label={
              <span>
                {CategoryLabel}&nbsp;
                <Tooltip title="Категорию, для которой хотите поменять советника.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
          >
            <Select suffixIcon={null} open={false} removeIcon={null}></Select>
          </Form.Item>
          <Form.Item
            name="delegate"
            label={
              <span>
                {DelegateLabel}&nbsp;
                <Tooltip title="Выберите советника, голос которого станет вашим голосом в голосованиях в указанной выше категории.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, выберите советника',
              },
            ]}
            hasFeedback
          >
            <CustomSelect
              requestOptions={fetchUsers}
              onChange={onCustomSelectChange}
              value={delegate?.delegate}
              formField="delegate"
              bindLabel="fullname"
              enableSearch={true}
            />
          </Form.Item>
        </Form>
      </div>
      <div className="toolbar">
        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          onClick={onFinish}
          disabled={disabled}
          className="toolbar-button"
        >
          Сохранить
        </Button>
        <Button
          type="primary"
          htmlType="button"
          onClick={onCancel}
          className="toolbar-button"
        >
          Назад
        </Button>
      </div>
    </>
  );
}
