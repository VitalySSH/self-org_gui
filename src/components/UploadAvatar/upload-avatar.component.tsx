import {
    LoadingOutlined,
    PlusOutlined,
    UserOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Flex,
    GetProp,
    message,
    Space,
    Upload,
    UploadProps
} from "antd";
import {  useState } from "react";
import FileStorageService from "../../services/file-storage.service.ts";
import { AuthContextProvider } from "../../interfaces";
import { CrudDataSourceService } from "../../services";
import { UserModel } from "../../models";
import {useAuth} from "../../hooks";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener(
        'load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
    const isJpgOrPng =
        file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('Вы можете загрузить изображение только форматов JPG или PNG ').then();
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Изображение должно быть меньше 2 MB!').then();
    }
    return isJpgOrPng && isLt2M;
};

export function UploadAvatar() {

    const authData: AuthContextProvider = useAuth();
    const fileStorageService = FileStorageService;

    const [loading, setLoading] =
        useState(false);
    const [imageUrl, setImageUrl] =
        useState<string>(fileStorageService.getFileUrl(authData.user?.foto_id));
    const [fileId, setFileId] =
        useState(authData.user?.foto_id);

    const userService =
        new CrudDataSourceService(UserModel);

    const saveUser = (fileId: string | null) => {
        if (authData.user?.id) {
            const userModel = userService.createRecord();
            userModel.id = authData.user?.id;
            userModel.foto_id = fileId;
            userService.save(userModel).then(() => {
                authData.changeFotoId(fileId);
                setFileId(fileId);
                message.success(
                    'Пользовательские данные обновлены').then();
            }).catch((error) => {
                console.log(`Ошибка сохранения данных пользователя: ${error}`);
            });
        }
    }

    const customRequest = (options: any) => {
        if (fileId) {
            fileStorageService.updateFile(
                fileId,
                options.file,
            ).then((r) => {
                options.onSuccess(r.data, options.file)
            }).catch((err: Error) => {
                options.onError(err, options.file);
            });
        } else {
            fileStorageService.createFile(options.file)
                .then(r => {
                    const fileId = r.data.id;
                    options.onSuccess(r.data, options.file);
                    saveUser(fileId);
                }).catch((err: Error) => {
                options.onError(err, options.file);
            });
        }
    };

    const handleChange: UploadProps['onChange'] =
        (info) => {
            if (info.file.status === 'uploading') {
                getBase64(info.file.originFileObj as FileType,
                    (url) => {
                        setLoading(false);
                        setImageUrl(url);
                    });
                setLoading(true);
                return;
            } else if (info.file.status === 'done') {
                message.success(
                    `Файл ${info.file.name} загружен`).then();
            } else if (info.file.status === 'error') {
                setLoading(false);
                message.error('Ошибка загрузки файла').then();
            }
    };

    const onDeleteFile = () => {
        if (fileId) {
            fileStorageService.deleteFile(fileId)
                .then(() => {
                    setImageUrl('');
                    message.success('Файл удалён').then();
                    saveUser(null);
                    // FIXME: сделать, чтобы после удаления Avatar появлялась icon
                });
        }
    }

    return (
        <Space style={{ justifyContent: "center" }}>
            <Flex gap="large" wrap align="center" justify="flex-end">
                <Avatar
                    draggable
                    size={{
                        xs: 64, sm: 90, md: 128, lg: 200, xl: 256, xxl: 300
                    }}
                    icon={<UserOutlined />}
                    src={imageUrl}
                />
            </Flex>
            <div style={{ justifyItems: "right" }}>
                <Button
                    style={{ marginTop: 16 }}
                    onClick={onDeleteFile}
                    disabled={!Boolean(fileId)}
                >
                    <DeleteOutlined/>
                    Удалить
                </Button>
                <Upload
                    name="avatar"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    customRequest={customRequest}
                >
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                    >
                        {loading ? <LoadingOutlined /> : <PlusOutlined />}
                        Загрузить
                    </Button>
                </Upload>
            </div>
        </Space>
    )
}
