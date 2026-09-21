import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';
export interface UserEntity {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    rol: string;
    telefono?: string;
    avatar_url?: string;
    activo: boolean;
    ultimo_acceso?: Date;
    created_at: Date;
    updated_at?: Date;
}
export interface UserWithClubEntity extends UserEntity {
    club_id?: string;
    club_nombre?: string;
    club_slug?: string;
    club_logo?: string;
}
export declare class AuthRepository extends BaseRepository<UserEntity> {
    constructor(db: DatabaseService);
    findByEmailWithClub(email: string): Promise<UserWithClubEntity | null>;
    findByIdWithClub(userId: string): Promise<UserWithClubEntity | null>;
    updateLastAccess(userId: string): Promise<void>;
    createUser(user: Partial<UserEntity>, clubId?: string): Promise<UserEntity>;
    updateProfile(userId: string, data: {
        nombre: string;
        apellido: string;
        telefono?: string;
        avatar?: string;
    }): Promise<UserEntity | null>;
    updatePassword(userId: string, newHash: string): Promise<void>;
}
