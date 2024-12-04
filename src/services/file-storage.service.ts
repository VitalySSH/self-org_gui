import {
    FileMetadataInterface
} from "src/interfaces";
import { DataSourceService } from "./data-source.service.ts";
import { baseApiUrl } from "src/config/configuration";

export class FileStorageService extends DataSourceService{



    constructor() {
        super(baseApiUrl);

    }

    async getFileMetaData(id: string) {
        return this.http.get<FileMetadataInterface>(
            `/file/metadata/${id}`,
            { headers: {'accept': 'application/json'} }
        );
    }
    async createFile(file: Blob) {
        const formData = new FormData();
        formData.append('file', file)

        return this.http.post<FileMetadataInterface>(
            'file/create',
            formData,
            { headers: {
                    'accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
            } }
        );
    }

    async createFileB64(
        base64: string, fileName: string, mimetype: string) {
        const data = {
            base_64: base64,
            file_name: fileName,
            mimetype: mimetype,
        }

        return this.http.post<FileMetadataInterface>(
            'file/create/b64',
            data,
            { headers: {'accept': 'application/json'} }
        );
    }

    async updateFile(id: string, file: Blob) {
        const formData = new FormData();
        formData.append('file', file)
        return this.http.patch<void>(
            `file/${id}`,
            formData,
            { headers: {
                    'accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                } }
        );
    }

    async updateFileB64(
        id: string,
        base64: string,
        fileName: string,
        mimetype: string
    ) {
        const data = {
            base_64: base64,
            file_name: fileName,
            mimetype: mimetype,
        }

        return this.http.patch<FileMetadataInterface>(
            `file/b64/${id}`,
            data,
            { headers: {'accept': 'application/json'} }
        );
    }

    async deleteFile(id: string) {
        return this.http.delete<void>(
            `file/${id}`,
            { headers: {'accept': 'application/json'} }
        );
    }

    async getFile(id: string) {
        return this.http.get<Blob>(
            `file/stream/${id}`,
            { headers: {'accept': 'application/json'},
                responseType: 'blob' }
        );
    }

    getFileUrl(id?: string | null): string {
        return id ? `${baseApiUrl}/file/stream/${id}` : '';
    }

}