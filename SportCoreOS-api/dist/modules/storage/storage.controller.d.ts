import { StorageService, UploadedFileResponse } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadSingleFile(user: any, file: Express.Multer.File, folder?: string, entidadTipo?: string, entidadId?: string, tipoDocumento?: string): Promise<UploadedFileResponse>;
    uploadMultipleFiles(user: any, files: Express.Multer.File[], folder?: string, entidadTipo?: string, entidadId?: string, tipoDocumento?: string): Promise<UploadedFileResponse[]>;
    getByEntidad(user: any, entidadTipo: string, entidadId: string): Promise<import("./archivos-adjuntos.repository").ArchivoAdjuntoEntity[]>;
    deleteFile(filePath: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
