"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const fs = require("fs");
const path = require("path");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    logger = new common_1.Logger(DatabaseService_1.name);
    pool;
    isPostgresConnected = false;
    memoryStore;
    async onModuleInit() {
        this.initMemoryStore();
        this.pool = new pg_1.Pool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '55132', 10),
            user: process.env.DB_USER || 'sportcore_user_qa',
            password: process.env.DB_PASSWORD || 'SportCoreQA2026*',
            database: process.env.DB_NAME || 'sportcoreos_db_qa',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        this.logger.log(`🔌 Conectando a Base de Datos PostgreSQL QA (${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '55132'} / ${process.env.DB_NAME || 'sportcoreos_db_qa'})...`);
        try {
            const client = await this.pool.connect();
            this.isPostgresConnected = true;
            this.logger.log('✅ Conexión establecida con PostgreSQL exitosamente.');
            try {
                const schemaPath = path.join(__dirname, 'schema.sql');
                const seedPath = path.join(__dirname, 'seed.sql');
                if (fs.existsSync(schemaPath)) {
                    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                    await client.query(schemaSql);
                    this.logger.log('📜 Esquema DDL verificado/migrado en PostgreSQL.');
                }
                if (fs.existsSync(seedPath)) {
                    const seedSql = fs.readFileSync(seedPath, 'utf8');
                    await client.query(seedSql);
                    this.logger.log('🌱 Datos Semilla (Seeds) verificados en PostgreSQL.');
                }
            }
            catch (migrationErr) {
                this.logger.warn(`Nota sobre migración automática: ${migrationErr.message}`);
            }
            finally {
                client.release();
            }
        }
        catch (err) {
            this.isPostgresConnected = false;
            this.logger.warn(`⚠️ PostgreSQL no disponible en puerto ${process.env.DB_PORT || '5432'} (${err.message}). Activando motor de persistencia reactiva en memoria con datos semilla oficiales de FutCoreOS.`);
        }
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
        }
    }
    async query(text, params = []) {
        if (this.isPostgresConnected) {
            const start = Date.now();
            try {
                const res = await this.pool.query(text, params);
                const duration = Date.now() - start;
                if (process.env.NODE_ENV === 'development' && duration > 200) {
                    this.logger.debug(`Query lenta (${duration}ms): ${text.substring(0, 80)}...`);
                }
                return res;
            }
            catch (error) {
                this.logger.error(`Error en query DB Postgres: ${text}`, error);
                throw error;
            }
        }
        return this.executeInMemoryQuery(text, params);
    }
    getPool() {
        if (this.isPostgresConnected) {
            return this.pool;
        }
        return {
            connect: async () => {
                return {
                    query: (qText, qParams) => this.query(qText, qParams || []),
                    release: () => { },
                };
            },
            end: async () => { },
        };
    }
    getStore() {
        return this.memoryStore;
    }
    executeInMemoryQuery(text, params = []) {
        const cleanSql = text.trim();
        const upperSql = cleanSql.toUpperCase();
        if (upperSql.includes('FROM PUBLIC.USUARIOS U') && upperSql.includes('LOWER(TRIM(U.EMAIL)) = LOWER(TRIM($1))')) {
            const email = (params[0] || '').toLowerCase().trim();
            const user = this.memoryStore.usuarios.find(u => u.email.toLowerCase() === email);
            if (!user) {
                return this.wrapResult([]);
            }
            const mem = this.memoryStore.membresias_club.find(m => m.usuario_id === user.id && m.activo);
            const club = mem ? this.memoryStore.clubes.find(c => c.id === mem.club_id) : null;
            const row = {
                ...user,
                club_id: club?.id,
                club_nombre: club?.nombre,
                club_slug: club?.slug,
                club_logo: club?.logo_url,
            };
            return this.wrapResult([row]);
        }
        if (upperSql.includes('FROM PUBLIC.USUARIOS U') && upperSql.includes('WHERE U.ID = $1')) {
            const userId = params[0];
            const user = this.memoryStore.usuarios.find(u => u.id === userId);
            if (!user) {
                return this.wrapResult([]);
            }
            const mem = this.memoryStore.membresias_club.find(m => m.usuario_id === user.id && m.activo);
            const club = mem ? this.memoryStore.clubes.find(c => c.id === mem.club_id) : null;
            const row = {
                ...user,
                club_id: club?.id,
                club_nombre: club?.nombre,
                club_slug: club?.slug,
                club_logo: club?.logo_url,
            };
            return this.wrapResult([row]);
        }
        if (upperSql.startsWith('UPDATE PUBLIC.USUARIOS SET ULTIMO_ACCESO = NOW() WHERE ID = $1')) {
            const userId = params[0];
            const user = this.memoryStore.usuarios.find(u => u.id === userId);
            if (user) {
                user.ultimo_acceso = new Date();
            }
            return this.wrapResult([], 1);
        }
        if (upperSql.startsWith('INSERT INTO PUBLIC.USUARIOS')) {
            const newUser = {
                id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                nombre: params[0],
                apellido: params[1],
                email: params[2],
                password_hash: params[3],
                rol: params[4],
                telefono: params[5] || null,
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                activo: true,
                created_at: new Date(),
                updated_at: new Date(),
            };
            this.memoryStore.usuarios.push(newUser);
            return this.wrapResult([newUser], 1);
        }
        if (upperSql.startsWith('INSERT INTO PUBLIC.MEMBRESIAS_CLUB')) {
            const newMem = {
                id: `m-${Date.now()}`,
                usuario_id: params[0],
                club_id: params[1],
                rol_club: params[2],
                activo: true,
                created_at: new Date(),
            };
            this.memoryStore.membresias_club.push(newMem);
            return this.wrapResult([newMem], 1);
        }
        if (upperSql.startsWith('UPDATE PUBLIC.USUARIOS') && upperSql.includes('SET NOMBRE = $1')) {
            const [nombre, apellido, telefono, avatar, userId] = params;
            const user = this.memoryStore.usuarios.find(u => u.id === userId);
            if (user) {
                user.nombre = nombre;
                user.apellido = apellido;
                user.telefono = telefono || null;
                if (avatar)
                    user.avatar_url = avatar;
                user.updated_at = new Date();
                return this.wrapResult([user], 1);
            }
            return this.wrapResult([], 0);
        }
        if (upperSql.startsWith('UPDATE PUBLIC.USUARIOS SET PASSWORD_HASH = $1')) {
            const [newHash, userId] = params;
            const user = this.memoryStore.usuarios.find(u => u.id === userId);
            if (user) {
                user.password_hash = newHash;
                user.updated_at = new Date();
                return this.wrapResult([], 1);
            }
            return this.wrapResult([], 0);
        }
        if (upperSql.includes('FROM PUBLIC.JUGADORES J') && upperSql.includes('JOIN PUBLIC.CATEGORIAS C')) {
            const clubId = params[0];
            let results = this.memoryStore.jugadores
                .filter(j => j.club_id === clubId)
                .map(j => {
                const cat = this.memoryStore.categorias.find(c => c.id === j.categoria_id);
                const bio = this.memoryStore.evaluaciones_biometricas
                    .filter(b => b.jugador_id === j.id)
                    .sort((a, b) => new Date(b.fecha_evaluacion).getTime() - new Date(a.fecha_evaluacion).getTime())[0];
                return {
                    ...j,
                    categoria_nombre: cat?.nombre || 'Sin Categoría',
                    codigo_categoria: cat?.codigo_categoria || 'N/A',
                    peso_kg: bio?.peso_kg || 58.5,
                    talla_cm: bio?.talla_cm || 168.0,
                    imc: bio?.imc || 20.7,
                };
            });
            if (params.length > 1 && params[1]) {
                const filterVal = params[1];
                if (typeof filterVal === 'string' && filterVal.startsWith('%')) {
                    const term = filterVal.replace(/%/g, '').toLowerCase();
                    results = results.filter(r => r.nombres.toLowerCase().includes(term) ||
                        r.apellidos.toLowerCase().includes(term) ||
                        r.numero_documento.includes(term));
                }
                else {
                    results = results.filter(r => r.categoria_id === filterVal);
                }
            }
            return this.wrapResult(results);
        }
        if (upperSql.includes('FROM PUBLIC.CATEGORIAS C') && upperSql.includes('WHERE C.CLUB_ID = $1')) {
            const clubId = params[0];
            const results = this.memoryStore.categorias
                .filter(c => c.club_id === clubId && c.activa)
                .map(c => {
                const dt = this.memoryStore.usuarios.find(u => u.id === c.director_tecnico_id);
                const totalJug = this.memoryStore.jugadores.filter(j => j.categoria_id === c.id && j.estado_matricula === 'ACTIVO').length;
                return {
                    ...c,
                    dt_id: dt?.id || null,
                    dt_nombre: dt ? `${dt.nombre} ${dt.apellido}` : 'Por asignar',
                    total_jugadores: totalJug,
                };
            });
            return this.wrapResult(results);
        }
        if (upperSql.includes('FROM PUBLIC.PARTIDOS P') && upperSql.includes('WHERE P.CLUB_ID = $1')) {
            const clubId = params[0];
            const results = this.memoryStore.partidos
                .filter(p => p.club_id === clubId)
                .map(p => {
                const cat = this.memoryStore.categorias.find(c => c.id === p.categoria_id);
                return {
                    ...p,
                    categoria_nombre: cat?.nombre || 'Categoría Principal',
                    codigo_categoria: cat?.codigo_categoria || 'CAT',
                    torneo_nombre: 'Liga Distrital de Bogotá',
                    tiene_convocatoria: 18,
                };
            });
            return this.wrapResult(results);
        }
        if (upperSql.includes('FROM PUBLIC.CARGOS_JUGADOR CJ') && upperSql.includes('COALESCE(SUM(CJ.MONTO_TOTAL')) {
            const clubId = params[0];
            const cargos = this.memoryStore.cargos_jugador.filter(c => c.club_id === clubId);
            const total_facturado = cargos.reduce((sum, c) => sum + (c.monto_total - (c.monto_descuento_beca || 0)), 0);
            const total_recaudado = cargos.reduce((sum, c) => sum + (c.monto_pagado || 0), 0);
            const total_en_mora = cargos.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0);
            const moraSet = new Set(cargos.filter(c => c.saldo_pendiente > 0).map(c => c.jugador_id));
            const summary = {
                total_facturado,
                total_recaudado,
                total_en_mora,
                total_jugadores_en_mora: moraSet.size,
            };
            return this.wrapResult([summary]);
        }
        if (upperSql.includes('FROM PUBLIC.CARGOS_JUGADOR CJ') && upperSql.includes('JOIN PUBLIC.JUGADORES J')) {
            const clubId = params[0];
            const results = this.memoryStore.cargos_jugador
                .filter(c => c.club_id === clubId)
                .map(c => {
                const jug = this.memoryStore.jugadores.find(j => j.id === c.jugador_id);
                const cat = jug ? this.memoryStore.categorias.find(ca => ca.id === jug.categoria_id) : null;
                const con = this.memoryStore.finanzas_conceptos.find(fc => fc.id === c.concepto_id);
                return {
                    ...c,
                    jugador_nombre: jug ? `${jug.nombres} ${jug.apellidos}` : 'Jugador Demo',
                    numero_documento: jug?.numero_documento || '102345678',
                    categoria_nombre: cat?.nombre || 'Sub-15 Élite A',
                    concepto_nombre: con?.nombre || 'Pensión Mensual',
                    concepto_tipo: con?.tipo || 'MENSUALIDAD',
                };
            });
            return this.wrapResult(results);
        }
        return this.wrapResult([]);
    }
    wrapResult(rows, rowCount) {
        return {
            rows,
            command: 'SELECT',
            rowCount: rowCount !== undefined ? rowCount : rows.length,
            oid: 0,
            fields: [],
        };
    }
    initMemoryStore() {
        this.memoryStore = {
            clubes: [
                {
                    id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Club Deportivo Futuros Cracks FC',
                    slug: 'futuros-cracks-fc',
                    sigla: 'FCFC',
                    ciudad: 'Bogotá D.C.',
                    pais: 'Colombia',
                    logo_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
                    plan: 'Plan Élite Pro',
                    activo: true,
                    created_at: new Date(),
                },
                {
                    id: 'd0222222-2222-2222-2222-222222222222',
                    nombre: 'Academia Semillero Santa Fe',
                    slug: 'semillero-santa-fe',
                    sigla: 'SSF',
                    ciudad: 'Medellín',
                    pais: 'Colombia',
                    logo_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
                    plan: 'Plan Élite Pro',
                    activo: true,
                    created_at: new Date(),
                },
                {
                    id: 'd0333333-3333-3333-3333-333333333333',
                    nombre: 'Millonarios Cantera Norte',
                    slug: 'millonarios-cantera-norte',
                    sigla: 'MCN',
                    ciudad: 'Cali',
                    pais: 'Colombia',
                    logo_url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=120&auto=format&fit=crop&q=80',
                    plan: 'Plan Élite Pro',
                    activo: true,
                    created_at: new Date(),
                },
            ],
            usuarios: [
                {
                    id: '00000000-0000-0000-0000-000000000001',
                    email: 'superadmin@sportcore.com',
                    password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2',
                    nombre: 'Super Administrador',
                    apellido: 'Global',
                    rol: 'SUPER_ADMIN',
                    telefono: '+57 300 000 0001',
                    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    activo: true,
                    ultimo_acceso: new Date(),
                    created_at: new Date(),
                },
                {
                    id: '00000000-0000-0000-0000-000000000002',
                    email: 'carlos.valderrama@sportcore.com',
                    password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2',
                    nombre: 'Carlos',
                    apellido: 'Valderrama',
                    rol: 'DIRECTOR_DEPORTIVO',
                    telefono: '+57 310 444 5555',
                    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    activo: true,
                    ultimo_acceso: new Date(),
                    created_at: new Date(),
                },
                {
                    id: '00000000-0000-0000-0000-000000000003',
                    email: 'mario.yepes@sportcore.com',
                    password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2',
                    nombre: 'Mario',
                    apellido: 'Yepes',
                    rol: 'ENTRENADOR_DT',
                    telefono: '+57 312 888 9999',
                    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                    activo: true,
                    ultimo_acceso: new Date(),
                    created_at: new Date(),
                },
                {
                    id: '00000000-0000-0000-0000-000000000004',
                    email: 'padre.diaz@sportcore.com',
                    password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2',
                    nombre: 'Luis',
                    apellido: 'Díaz Padre',
                    rol: 'PADRE_ACUDIENTE',
                    telefono: '+57 315 777 6666',
                    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
                    activo: true,
                    ultimo_acceso: new Date(),
                    created_at: new Date(),
                },
                {
                    id: '00000000-0000-0000-0000-000000000005',
                    email: 'finanzas@sportcore.com',
                    password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2',
                    nombre: 'Diana',
                    apellido: 'Morales',
                    rol: 'ADMIN_FINANCIERO',
                    telefono: '+57 320 111 2233',
                    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
                    activo: true,
                    ultimo_acceso: new Date(),
                    created_at: new Date(),
                },
            ],
            membresias_club: [
                {
                    id: '20000000-0000-0000-0000-000000000001',
                    usuario_id: '00000000-0000-0000-0000-000000000001',
                    club_id: '10000000-0000-0000-0000-000000000001',
                    rol_club: 'SUPER_ADMIN',
                    activo: true,
                },
                {
                    id: '20000000-0000-0000-0000-000000000002',
                    usuario_id: '00000000-0000-0000-0000-000000000002',
                    club_id: '10000000-0000-0000-0000-000000000001',
                    rol_club: 'DIRECTOR_DEPORTIVO',
                    activo: true,
                },
                {
                    id: '20000000-0000-0000-0000-000000000003',
                    usuario_id: '00000000-0000-0000-0000-000000000003',
                    club_id: '10000000-0000-0000-0000-000000000001',
                    rol_club: 'ENTRENADOR_DT',
                    activo: true,
                },
                {
                    id: '20000000-0000-0000-0000-000000000004',
                    usuario_id: '00000000-0000-0000-0000-000000000004',
                    club_id: '10000000-0000-0000-0000-000000000001',
                    rol_club: 'PADRE_ACUDIENTE',
                    activo: true,
                },
                {
                    id: '20000000-0000-0000-0000-000000000005',
                    usuario_id: '00000000-0000-0000-0000-000000000005',
                    club_id: '10000000-0000-0000-0000-000000000001',
                    rol_club: 'ADMIN_FINANCIERO',
                    activo: true,
                },
            ],
            categorias: [
                {
                    id: '30000000-0000-0000-0000-000000000001',
                    club_id: '10000000-0000-0000-0000-000000000001',
                    nombre: 'Sub-15 Élite A',
                    codigo_categoria: 'SUB15-A',
                    anio_nacimiento_min: 2011,
                    anio_nacimiento_max: 2012,
                    rama: 'MASCULINO',
                    nivel_competencia: 'COMPETITIVO',
                    color_distintivo: '#10B981',
                    director_tecnico_id: 'u2222222-2222-2222-2222-222222222222',
                    cupo_maximo: 25,
                    activa: true,
                },
                {
                    id: 'c0222222-2222-2222-2222-222222222222',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Sub-17 Nacional Pro',
                    codigo_categoria: 'SUB17-PRO',
                    anio_nacimiento_min: 2009,
                    anio_nacimiento_max: 2010,
                    rama: 'MASCULINO',
                    nivel_competencia: 'ALTO_RENDIMIENTO',
                    color_distintivo: '#3B82F6',
                    director_tecnico_id: 'u1111111-1111-1111-1111-111111111111',
                    cupo_maximo: 22,
                    activa: true,
                },
                {
                    id: 'c0333333-3333-3333-3333-333333333333',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Sub-13 Semillero Talentos',
                    codigo_categoria: 'SUB13-TAL',
                    anio_nacimiento_min: 2013,
                    anio_nacimiento_max: 2014,
                    rama: 'MASCULINO',
                    nivel_competencia: 'FORMATIVO',
                    color_distintivo: '#F59E0B',
                    director_tecnico_id: null,
                    cupo_maximo: 28,
                    activa: true,
                },
            ],
            jugadores: [
                {
                    id: 'j0111111-1111-1111-1111-111111111111',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    categoria_id: 'c0111111-1111-1111-1111-111111111111',
                    nombres: 'Mateo',
                    apellidos: 'Gómez Restrepo',
                    tipo_documento: 'TI',
                    numero_documento: '1023456781',
                    fecha_nacimiento: '2011-04-15',
                    genero: 'MASCULINO',
                    posicion_principal: 'Extremo Derecho',
                    posicion_secundaria: 'Delantero Centro',
                    pierna_habil: 'DIESTRO',
                    numero_dorsal: 7,
                    foto_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
                    eps: 'SURA EPS',
                    estado_matricula: 'ACTIVO',
                    created_at: new Date(),
                },
                {
                    id: 'j0222222-2222-2222-2222-222222222222',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    categoria_id: 'c0111111-1111-1111-1111-111111111111',
                    nombres: 'Samuel',
                    apellidos: 'Díaz Marín',
                    tipo_documento: 'TI',
                    numero_documento: '1023456782',
                    fecha_nacimiento: '2011-08-20',
                    genero: 'MASCULINO',
                    posicion_principal: 'Volante Ofensivo (10)',
                    posicion_secundaria: 'Mediocentro',
                    pierna_habil: 'ZURDO',
                    numero_dorsal: 10,
                    foto_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
                    eps: 'Sanitas EPS',
                    estado_matricula: 'ACTIVO',
                    created_at: new Date(),
                },
                {
                    id: 'j0333333-3333-3333-3333-333333333333',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    categoria_id: 'c0111111-1111-1111-1111-111111111111',
                    nombres: 'Esteban',
                    apellidos: 'Pérez Salazar',
                    tipo_documento: 'TI',
                    numero_documento: '1023456783',
                    fecha_nacimiento: '2011-01-10',
                    genero: 'MASCULINO',
                    posicion_principal: 'Defensa Central',
                    posicion_secundaria: 'Lateral Derecho',
                    pierna_habil: 'DIESTRO',
                    numero_dorsal: 4,
                    foto_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
                    eps: 'Compensar EPS',
                    estado_matricula: 'ACTIVO',
                    created_at: new Date(),
                },
            ],
            acudientes: [],
            jugador_acudientes: [],
            evaluaciones_biometricas: [
                {
                    id: 'b01',
                    jugador_id: 'j0111111-1111-1111-1111-111111111111',
                    evaluador_id: 'u2222222-2222-2222-2222-222222222222',
                    fecha_evaluacion: new Date('2026-03-01'),
                    peso_kg: 56.4,
                    talla_cm: 167.5,
                    imc: 20.1,
                    test_cooper_metros: 2850,
                    velocidad_30m_seg: 3.92,
                    salto_vertical_cm: 42.5,
                },
                {
                    id: 'b02',
                    jugador_id: 'j0222222-2222-2222-2222-222222222222',
                    evaluador_id: 'u2222222-2222-2222-2222-222222222222',
                    fecha_evaluacion: new Date('2026-03-01'),
                    peso_kg: 52.8,
                    talla_cm: 162.0,
                    imc: 20.1,
                    test_cooper_metros: 2980,
                    velocidad_30m_seg: 3.88,
                    salto_vertical_cm: 45.0,
                },
            ],
            partidos: [
                {
                    id: 'p0111111-1111-1111-1111-111111111111',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    categoria_id: 'c0111111-1111-1111-1111-111111111111',
                    rival_nombre: 'Atlético Nacional Cantera Bogotá',
                    fecha_partido: '2026-03-22',
                    hora_partido: '10:00:00',
                    hora_citacion: '09:00:00',
                    sede_cancha: 'Cancha Sintética Sede Norte #2',
                    condicion_juego: 'LOCAL',
                    indumentaria_kit: 'Kit Titular (Esmeralda)',
                    estado_partido: 'PROGRAMADO',
                    goles_club: 0,
                    goles_rival: 0,
                },
                {
                    id: 'p0222222-2222-2222-2222-222222222222',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    categoria_id: 'c0222222-2222-2222-2222-222222222222',
                    rival_nombre: 'Deportivo Cali Filial Capital',
                    fecha_partido: '2026-03-25',
                    hora_partido: '14:30:00',
                    hora_citacion: '13:30:00',
                    sede_cancha: 'Complejo Deportivo Campincito',
                    condicion_juego: 'VISITANTE',
                    indumentaria_kit: 'Kit Alterno (Blanco)',
                    estado_partido: 'PROGRAMADO',
                    goles_club: 0,
                    goles_rival: 0,
                },
            ],
            convocatorias: [],
            actas_partido_eventos: [],
            finanzas_conceptos: [
                {
                    id: 'f0111111-1111-1111-1111-111111111111',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Pensión Mensual Formativa',
                    tipo: 'MENSUALIDAD',
                    monto_base: 220000.0,
                    activo: true,
                },
                {
                    id: 'f0222222-2222-2222-2222-222222222222',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Matrícula Anual Temporada 2026',
                    tipo: 'MATRICULA',
                    monto_base: 350000.0,
                    activo: true,
                },
            ],
            cargos_jugador: [
                {
                    id: 'cj01',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    jugador_id: 'j0111111-1111-1111-1111-111111111111',
                    concepto_id: 'f0111111-1111-1111-1111-111111111111',
                    periodo_mes: 3,
                    periodo_anio: 2026,
                    monto_total: 220000,
                    monto_descuento_beca: 0,
                    monto_pagado: 220000,
                    saldo_pendiente: 0,
                    estado_pago: 'PAGADO',
                    fecha_limite_pago: '2026-03-10',
                },
                {
                    id: 'cj02',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    jugador_id: 'j0222222-2222-2222-2222-222222222222',
                    concepto_id: 'f0111111-1111-1111-1111-111111111111',
                    periodo_mes: 3,
                    periodo_anio: 2026,
                    monto_total: 220000,
                    monto_descuento_beca: 50000,
                    monto_pagado: 0,
                    saldo_pendiente: 170000,
                    estado_pago: 'PENDIENTE',
                    fecha_limite_pago: '2026-03-15',
                },
            ],
            canchas: [
                {
                    id: 'ca011111-1111-1111-1111-111111111111',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Cancha Sintética 8 - El Campín',
                    tipo_superficie: 'sintetica_f8',
                    precio_hora_diurna: 85000,
                    precio_hora_nocturna: 120000,
                    hora_apertura: '06:00',
                    hora_cierre: '23:00',
                    activa: true,
                    created_at: new Date(),
                },
                {
                    id: 'ca022222-2222-2222-2222-222222222222',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Cancha Sintética 5 - La Castellana',
                    tipo_superficie: 'sintetica_f5',
                    precio_hora_diurna: 60000,
                    precio_hora_nocturna: 90000,
                    hora_apertura: '06:00',
                    hora_cierre: '23:00',
                    activa: true,
                    created_at: new Date(),
                },
                {
                    id: 'ca033333-3333-3333-3333-333333333333',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    nombre: 'Cancha Grama Natural 11 - Sede Principal',
                    tipo_superficie: 'natural_f11',
                    precio_hora_diurna: 150000,
                    precio_hora_nocturna: 210000,
                    hora_apertura: '07:00',
                    hora_cierre: '22:00',
                    activa: true,
                    created_at: new Date(),
                },
            ],
            reservas_cancha: [
                {
                    id: 'rc01',
                    cancha_id: 'ca011111-1111-1111-1111-111111111111',
                    fecha_reserva: new Date().toISOString().split('T')[0],
                    hora_inicio: '17:00',
                    hora_fin: '18:00',
                    tipo_reserva: 'entrenamiento_club',
                    cliente_nombre: 'Categoría Sub-15 Élite',
                    cliente_telefono: null,
                    monto_total: 0,
                    monto_anticipo: 0,
                    estado_pago: 'exonerado',
                    estado_turno: 'confirmado',
                    created_at: new Date(),
                },
                {
                    id: 'rc02',
                    cancha_id: 'ca011111-1111-1111-1111-111111111111',
                    fecha_reserva: new Date().toISOString().split('T')[0],
                    hora_inicio: '19:00',
                    hora_fin: '20:00',
                    tipo_reserva: 'alquiler_particular',
                    cliente_nombre: 'Andrés Pérez (Torneo Nocturno)',
                    cliente_telefono: '+57 310 999 8888',
                    monto_total: 120000,
                    monto_anticipo: 60000,
                    estado_pago: 'parcial',
                    estado_turno: 'confirmado',
                    created_at: new Date(),
                },
            ],
            productos_tienda: [
                {
                    id: 'prod01',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    codigo_sku: 'KIT-TITULAR-2026',
                    nombre: 'Kit Oficial Titular 2026 (Camisilla + Short + Medias)',
                    categoria: 'uniforme_oficial',
                    precio_venta: 145000,
                    foto_url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=300&auto=format&fit=crop&q=80',
                    personalizable: true,
                    activo: true,
                    created_at: new Date(),
                },
                {
                    id: 'prod02',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    codigo_sku: 'KIT-ALTERNO-2026',
                    nombre: 'Kit Oficial Alterno 2026 (Blanco Élite)',
                    categoria: 'uniforme_oficial',
                    precio_venta: 140000,
                    foto_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
                    personalizable: true,
                    activo: true,
                    created_at: new Date(),
                },
                {
                    id: 'prod03',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    codigo_sku: 'BALON-F5-PRO',
                    nombre: 'Balón Oficial de Entrenamiento Golty FIFA Quality #4',
                    categoria: 'balones',
                    precio_venta: 89000,
                    foto_url: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=300&auto=format&fit=crop&q=80',
                    personalizable: false,
                    activo: true,
                    created_at: new Date(),
                },
                {
                    id: 'prod04',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    codigo_sku: 'PETO-FLUO-SET',
                    nombre: 'Set de 10 Petos Fluo de Entrenamiento (Reforzados)',
                    categoria: 'entrenamiento',
                    precio_venta: 65000,
                    foto_url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=300&auto=format&fit=crop&q=80',
                    personalizable: false,
                    activo: true,
                    created_at: new Date(),
                },
            ],
            variantes_producto: [
                { id: 'var01', producto_id: 'prod01', talla: '8', stock_actual: 12, stock_minimo_alerta: 4 },
                { id: 'var02', producto_id: 'prod01', talla: '10', stock_actual: 18, stock_minimo_alerta: 5 },
                { id: 'var03', producto_id: 'prod01', talla: '12', stock_actual: 8, stock_minimo_alerta: 5 },
                { id: 'var04', producto_id: 'prod01', talla: '14', stock_actual: 3, stock_minimo_alerta: 5 },
                { id: 'var05', producto_id: 'prod01', talla: 'S', stock_actual: 15, stock_minimo_alerta: 4 },
                { id: 'var06', producto_id: 'prod01', talla: 'M', stock_actual: 20, stock_minimo_alerta: 5 },
                { id: 'var07', producto_id: 'prod02', talla: '10', stock_actual: 10, stock_minimo_alerta: 4 },
                { id: 'var08', producto_id: 'prod02', talla: '12', stock_actual: 14, stock_minimo_alerta: 4 },
                { id: 'var09', producto_id: 'prod02', talla: 'M', stock_actual: 12, stock_minimo_alerta: 4 },
                { id: 'var10', producto_id: 'prod03', talla: 'ÚNICA', stock_actual: 25, stock_minimo_alerta: 6 },
                { id: 'var11', producto_id: 'prod04', talla: 'ÚNICA', stock_actual: 9, stock_minimo_alerta: 3 },
            ],
            pedidos_tienda: [
                {
                    id: 'ped01',
                    club_id: 'd0111111-1111-1111-1111-111111111111',
                    variante_id: 'var03',
                    jugador_id: 'j0111111-1111-1111-1111-111111111111',
                    cantidad: 1,
                    precio_unitario: 145000,
                    monto_total: 145000,
                    estampado_nombre: 'GÓMEZ',
                    estampado_dorsal: 7,
                    comprador_nombre: 'Mauricio Gómez',
                    comprador_telefono: '+57 312 333 4455',
                    estado_pago: 'PAGADO',
                    estado_despacho: 'PENDIENTE_ENTREGA',
                    metodo_pago: 'WOMPI_PSE',
                    codigo_qr: 'SPORT-TIENDA-MATEO-07',
                    created_at: new Date(),
                },
            ],
        };
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map