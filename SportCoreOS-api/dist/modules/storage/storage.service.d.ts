import { ArchivosAdjuntosRepository, ArchivoAdjuntoEntity } from './archivos-adjuntos.repository';
import { UploadOrigin } from './storage-paths.constants';
export interface UploadedFileResponse {
    id?: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    sha256?: string;
    url: string;
    path: string;
}
export declare class StorageService {
    private readonly archivosRepo;
    private readonly logger;
    private readonly uploadsBasePath;
    private readonly allowedMimeTypes;
    private readonly maxFileSize;
    constructor(archivosRepo: ArchivosAdjuntosRepository);
    saveFile(file: Express.Multer.File, subfolder?: string, clubId?: string, userId?: string, entidadTipo?: string, entidadId?: string, tipoDocumento?: string, origen?: UploadOrigin): Promise<UploadedFileResponse>;
    saveMultipleFiles(files: Express.Multer.File[], subfolder?: string, clubId?: string, userId?: string, entidadTipo?: string, entidadId?: string, tipoDocumento?: string, origen?: UploadOrigin): Promise<UploadedFileResponse[]>;
    linkFilesToEntity(clubId: string, fileIds: string[], entityId: string, entityType: string): Promise<void>;
    linkFilesByUrls(clubId: string, urls: string[], entityId: string, entityType: string): Promise<void>;
    getArchivosByEntidad(clubId: string, entidadTipo: string, entidadId: string): Promise<ArchivoAdjuntoEntity[]>;
    deleteFile(relativePath: string): Promise<boolean>;
    private ensureDirectoryExists;
}
