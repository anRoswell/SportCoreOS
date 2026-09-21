import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
interface InMemoryStore {
    clubes: any[];
    usuarios: any[];
    membresias_club: any[];
    categorias: any[];
    jugadores: any[];
    acudientes: any[];
    jugador_acudientes: any[];
    evaluaciones_biometricas: any[];
    partidos: any[];
    convocatorias: any[];
    actas_partido_eventos: any[];
    finanzas_conceptos: any[];
    cargos_jugador: any[];
    canchas: any[];
    reservas_cancha: any[];
    productos_tienda: any[];
    variantes_producto: any[];
    pedidos_tienda: any[];
}
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private pool;
    private isPostgresConnected;
    private memoryStore;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    getPool(): Pool;
    getStore(): InMemoryStore;
    private executeInMemoryQuery;
    private wrapResult;
    private initMemoryStore;
}
export {};
