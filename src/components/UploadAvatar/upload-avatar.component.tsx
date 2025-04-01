import { UserOutlined, CloseOutlined } from '@ant-design/icons';
import { Avatar, GetProp, Upload, UploadProps, Tooltip, App } from 'antd';
import { useState } from 'react';
import { AuthContextProvider, UserUpdateInterface } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { AuthApiClientService, FileStorageService } from 'src/services';
import './upload-avatar.component.scss';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export function UploadAvatar() {
  const authData: AuthContextProvider = useAuth();
  const { modal, message } = App.useApp();

  const authApiClientService = new AuthApiClientService();
  const fileStorageService = new FileStorageService();

  const [fileId, setFileId] = useState(authData.user?.foto_id);

  const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message
        .error('Вы можете загрузить изображение только форматов JPG или PNG')
        .then();
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Изображение должно быть меньше 2 MB!').then();
      return Upload.LIST_IGNORE;
    }
    return isJpgOrPng && isLt2M;
  };

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
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as FileType, (url) => {
        authData.changeAvatarUrl(fileId, url);
        message.success(`Аватар обновлён`).then();
      });
    } else if (info.file.status === 'error') {
      message.error('Ошибка загрузки аватара').then();
    }
  };

  const handleDelete = () => {
    modal.confirm({
      title: 'Удалить фото?',
      content: 'Вы уверены, что хотите удалить текущее фото профиля?',
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: { danger: true },
      centered: false,
      maskClosable: true,
      styles: {
        content: {
          width: '400px',
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
          justifyContent: 'center',
        },
        body: {
          padding: '16px',
          fontSize: '14px',
          wordWrap: 'break-word',
        },
      },
      onOk: () => {
        if (fileId) {
          fileStorageService
            .deleteFile(fileId)
            .then(() => {
              saveUser(null);
              authData.changeAvatarUrl(null, undefined);
              message.success('Фото удалено').then();
            })
            .catch((error) => {
              message.error(`Ошибка удаления аватара: ${error}`).then();
            });
        } else {
          authData.changeAvatarUrl(null, undefined);
        }
      },
    });
  };

  return (
    <div className="avatar-container">
      <Tooltip title="Нажмите для загрузки фото" placement="bottom">
        <Upload
          name="avatar"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={customRequest}
          accept="image/jpeg,image/png"
        >
          <div className="avatar-wrapper">
            <Avatar
              className="user-avatar"
              size={{
                xs: 120,
                sm: 160,
                md: 200,
                lg: 240,
                xl: 280,
                xxl: 320,
              }}
              icon={
                <div className="avatar-placeholder">
                  <UserOutlined className="placeholder-icon" />
                </div>
              }
              src={authData.avatarUrl}
            />
          </div>
        </Upload>
      </Tooltip>

      {authData.avatarUrl && (
        <Tooltip title="Удалить фото">
          <button className="delete-button" onClick={handleDelete}>
            <CloseOutlined />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
