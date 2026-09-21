import { DatabaseService } from '../../database/database.service';
export interface ClubEntity {
    id: string;
    nombre: string;
    slug: string;
    sigla: string;
    ciudad: string;
    pais: string;
    logo_url: string | null;
    plan: string;
    activo: boolean;
    configuracion_json: any;
    created_at: Date;
    updated_at: Date;
}
export declare class ClubesRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findAll(onlyActive?: boolean): Promise<ClubEntity[]>;
    findById(id: string): Promise<ClubEntity | null>;
    findBySlug(slug: string): Promise<ClubEntity | null>;
    create(data: {
        nombre: string;
        slug: string;
        sigla: string;
        ciudad: string;
        pais: string;
        logo_url?: string | null;
        plan?: string;
        activo?: boolean;
        configuracion_json?: any;
    }): Promise<ClubEntity>;
    update(id: string, data: Partial<ClubEntity>): Promise<ClubEntity | null>;
    delete(id: string): Promise<boolean>;
    findStaffByClub(clubId: string): Promise<any[]>;
}
