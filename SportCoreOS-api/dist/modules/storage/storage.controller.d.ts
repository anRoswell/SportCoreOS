import { StorageService, UploadedFileResponse } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadSingleFile(file: Express.Multer.File, folder?: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general'): Promise<UploadedFileResponse>;
    uploadMultipleFiles(files: Express.Multer.File[], folder?: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general'): Promise<UploadedFileResponse[]>;
    deleteFile(filePath: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
