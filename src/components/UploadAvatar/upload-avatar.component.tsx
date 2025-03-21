import {
  LoadingOutlined,
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Flex,
  GetProp,
  message,
  Space,
  Upload,
  UploadProps,
} from 'antd';
import { useState } from 'react';
import { AuthContextProvider, UserUpdateInterface } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { AuthApiClientService, FileStorageService } from 'src/services';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message
      .error('Вы можете загрузить изображение только форматов JPG или PNG ')
      .then();
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Изображение должно быть меньше 2 MB!').then();
  }
  return isJpgOrPng && isLt2M;
};

export function UploadAvatar() {
  const authData: AuthContextProvider = useAuth();
  const authApiClientService = new AuthApiClientService();
  const fileStorageService = new FileStorageService();

  const [loading, setLoading] = useState(false);
  fileStorageService.getFileUrl(authData.user?.foto_id);
  const [fileId, setFileId] = useState(authData.user?.foto_id);

  const saveUser = (fileId: string | null) => {
    if (authData.user?.id) {
      const userData: UserUpdateInterface = {
        foto_id: fileId,
      };
      authApiClientService
        .updateUser(authData.user?.id, userData)
        .then(() => {
          authData.changeFotoId(fileId);
          setFileId(fileId);
          message.success('Пользовательские данные обновлены').then();
        })
        .catch((error) => {
          console.log(`Ошибка сохранения данных пользователя: ${error}`);
        });
    }
  };

  const customRequest = (options: any) => {
    if (fileId) {
      fileStorageService
        .updateFile(fileId, options.file)
        .then((r) => {
          options.onSuccess(r.data, options.file);
        })
        .catch((err: Error) => {
          options.onError(err, options.file);
        });
    } else {
      fileStorageService
        .createFile(options.file)
        .then((r) => {
          const fileId = r.data.id;
          options.onSuccess(r.data, options.file);
          saveUser(fileId);
        })
        .catch((err: Error) => {
          options.onError(err, options.file);
        });
    }
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    } else if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        authData.changeAvatarUrl(fileId, url);
        message.success(`Файл ${info.file.name} загружен`).then();
      });
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error('Ошибка загрузки файла').then();
    }
  };

  const onDeleteFile = () => {
    if (fileId) {
      fileStorageService.deleteFile(fileId).then(() => {
        message.success('Файл удалён').then();
        saveUser(null);
        authData.changeAvatarUrl(fileId, '');
        // FIXME: сделать, чтобы после удаления Avatar появлялась icon
      });
    }
  };

  return (
    <Space style={{ justifyContent: 'center' }}>
      <Flex gap="large" wrap align="center" justify="flex-end">
        <Avatar
          draggable
          size={{
            xs: 64,
            sm: 90,
            md: 128,
            lg: 200,
            xl: 256,
            xxl: 300,
          }}
          icon={<UserOutlined style={{ fontSize: 72 }} />}
          src={authData.avatarUrl}
        />
      </Flex>
      <div style={{ justifyItems: 'right', margin: 8 }}>
        <Button
          style={{ margin: 'auto', marginBottom: 12, width: 128 }}
          onClick={onDeleteFile}
          disabled={!fileId}
        >
          <DeleteOutlined />
          Удалить
        </Button>
        <Upload
          name="avatar"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={customRequest}
        >
          <Button style={{ margin: 'auto', width: 128 }}>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            Загрузить
          </Button>
        </Upload>
      </div>
    </Space>
  );
}
