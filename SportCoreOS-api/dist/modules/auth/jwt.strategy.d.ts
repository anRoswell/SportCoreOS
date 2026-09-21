import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
export interface JwtPayload {
    sub: string;
    email: string;
    nombre: string;
    rol: string;
    clubId?: string;
    clubNombre?: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly db;
    constructor(db: DatabaseService, config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: any;
        email: any;
        nombre: any;
        apellido: any;
        rol: any;
        clubId: string;
        clubNombre: string;
    }>;
}
export {};
