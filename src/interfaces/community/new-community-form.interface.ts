import { FormInstance } from 'antd/es/form/hooks/useForm';

export interface NewCommunityFormProps {
  form: FormInstance;
  setDisabledButton: (event: boolean) => void;
}
