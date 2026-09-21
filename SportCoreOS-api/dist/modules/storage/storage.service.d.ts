export interface UploadedFileResponse {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    path: string;
}
export declare class StorageService {
    private readonly logger;
    private readonly uploadsBasePath;
    private readonly allowedMimeTypes;
    private readonly maxFileSize;
    constructor();
    saveFile(file: Express.Multer.File, subfolder?: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general'): Promise<UploadedFileResponse>;
    saveMultipleFiles(files: Express.Multer.File[], subfolder?: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general'): Promise<UploadedFileResponse[]>;
    deleteFile(relativePath: string): Promise<boolean>;
    private ensureDirectoryExists;
}
