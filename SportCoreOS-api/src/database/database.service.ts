import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

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
  parametros_sistema: any[];
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;
  private isPostgresConnected = false;
  private memoryStore!: InMemoryStore;

  async onModuleInit() {
    this.initMemoryStore();

    this.pool = new Pool({
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
      
      // Intentar auto-migración DDL & Seed si existe schema.sql
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
      } catch (migrationErr: any) {
        this.logger.warn(`Nota sobre migración automática: ${migrationErr.message}`);
      } finally {
        client.release();
      }
    } catch (err: any) {
      this.isPostgresConnected = false;
      this.logger.warn(
        `⚠️ PostgreSQL no disponible en puerto ${process.env.DB_PORT || '5432'} (${err.message}). Activando motor de persistencia reactiva en memoria con datos semilla oficiales de FutCoreOS.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (this.isPostgresConnected) {
      const start = Date.now();
      try {
        const res = await this.pool.query<T>(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development' && duration > 200) {
          this.logger.debug(`Query lenta (${duration}ms): ${text.substring(0, 80)}...`);
        }
        return res;
      } catch (error) {
        this.logger.error(`Error en query DB Postgres: ${text}`, error);
        throw error;
      }
    }

    // Fallback motor en memoria relacional
    return this.executeInMemoryQuery<T>(text, params);
  }

  getPool(): Pool {
    if (this.isPostgresConnected) {
      return this.pool;
    }

    // Retorna un mock compatible para PoolClient con transacciones
    return {
      connect: async (): Promise<PoolClient> => {
        return {
          query: (qText: string, qParams?: any[]) => this.query(qText, qParams || []),
          release: () => {},
        } as unknown as PoolClient;
      },
      end: async () => {},
    } as unknown as Pool;
  }

  getStore(): InMemoryStore {
    return this.memoryStore;
  }

  // ==========================================================================
  // MOTOR DE CONSULTAS EN MEMORIA CON SOPORTE DE JOINS Y FILTROS
  // ==========================================================================
  private executeInMemoryQuery<T extends QueryResultRow>(text: string, params: any[] = []): QueryResult<T> {
    const cleanSql = text.trim();
    const upperSql = cleanSql.toUpperCase();

    // 1. SELECT USUARIOS POR EMAIL CON CLUB
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
      return this.wrapResult([row as unknown as T]);
    }

    // 2. SELECT USUARIOS POR ID CON CLUB
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
      return this.wrapResult([row as unknown as T]);
    }

    // 3. UPDATE ULTIMO ACCESO
    if (upperSql.startsWith('UPDATE PUBLIC.USUARIOS SET ULTIMO_ACCESO = NOW() WHERE ID = $1')) {
      const userId = params[0];
      const user = this.memoryStore.usuarios.find(u => u.id === userId);
      if (user) {
        user.ultimo_acceso = new Date();
      }
      return this.wrapResult([], 1);
    }

    // 4. INSERT USUARIO
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
      return this.wrapResult([newUser as unknown as T], 1);
    }

    // 5. INSERT MEMBRESIA CLUB
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
      return this.wrapResult([newMem as unknown as T], 1);
    }

    // 6. UPDATE PERFIL USUARIO
    if (upperSql.startsWith('UPDATE PUBLIC.USUARIOS') && upperSql.includes('SET NOMBRE = $1')) {
      const [nombre, apellido, telefono, avatar, userId] = params;
      const user = this.memoryStore.usuarios.find(u => u.id === userId);
      if (user) {
        user.nombre = nombre;
        user.apellido = apellido;
        user.telefono = telefono || null;
        if (avatar) user.avatar_url = avatar;
        user.updated_at = new Date();
        return this.wrapResult([user as unknown as T], 1);
      }
      return this.wrapResult([], 0);
    }

    // 7. UPDATE PASSWORD USUARIO
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

    // 8. SELECT JUGADORES POR CLUB
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
        // Categoria filter or search
        const filterVal = params[1];
        if (typeof filterVal === 'string' && filterVal.startsWith('%')) {
          const term = filterVal.replace(/%/g, '').toLowerCase();
          results = results.filter(r => 
            r.nombres.toLowerCase().includes(term) ||
            r.apellidos.toLowerCase().includes(term) ||
            r.numero_documento.includes(term)
          );
        } else {
          results = results.filter(r => r.categoria_id === filterVal);
        }
      }

      return this.wrapResult(results as unknown as T[]);
    }

    // 9. SELECT CATEGORIAS POR CLUB
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
      return this.wrapResult(results as unknown as T[]);
    }

    // 10. SELECT PARTIDOS POR CLUB
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
      return this.wrapResult(results as unknown as T[]);
    }

    // 11. SELECT RESUMEN FINANCIERO
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
      return this.wrapResult([summary as unknown as T]);
    }

    // 12. SELECT CARGOS POR COBRAR
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
      return this.wrapResult(results as unknown as T[]);
    }

    // 13. SELECT PARAMETROS DEL SISTEMA (FIND ALL, BY MODULO, BY CLAVE, BY ID)
    if (upperSql.includes('FROM CORE.PARAMETROS_SISTEMA') || upperSql.includes('FROM CORE.PARAMETROS_SISTEMA P')) {
      // By modulo
      if (upperSql.includes('WHERE P.MODULO = $1') || upperSql.includes('WHERE MODULO = $1')) {
        const modulo = (params[0] || '').toString().toUpperCase();
        const clubId = params[1] || null;
        const results = (this.memoryStore.parametros_sistema || []).filter(
          p => p.modulo === modulo && (!clubId || p.club_id === clubId || p.club_id === null)
        );
        return this.wrapResult(results as unknown as T[]);
      }
      // By clave with club_id
      if (upperSql.includes('WHERE CLAVE = $1 AND CLUB_ID = $2')) {
        const [clave, clubId] = params;
        const found = (this.memoryStore.parametros_sistema || []).find(
          p => p.clave === clave && p.club_id === clubId
        );
        return this.wrapResult(found ? [found as unknown as T] : []);
      }
      // By clave global
      if (upperSql.includes('WHERE CLAVE = $1 AND CLUB_ID IS NULL')) {
        const [clave] = params;
        const found = (this.memoryStore.parametros_sistema || []).find(
          p => p.clave === clave && (p.club_id === null || p.club_id === undefined)
        );
        return this.wrapResult(found ? [found as unknown as T] : []);
      }
      // By ID
      if (upperSql.includes('WHERE ID = $1')) {
        const id = params[0];
        const found = (this.memoryStore.parametros_sistema || []).find(p => p.id === id);
        return this.wrapResult(found ? [found as unknown as T] : []);
      }
      // Find all
      const clubId = params[0] || null;
      const results = (this.memoryStore.parametros_sistema || []).filter(
        p => !clubId || p.club_id === clubId || p.club_id === null
      );
      return this.wrapResult(results as unknown as T[]);
    }

    // 14. INSERT PARAMETRO SISTEMA
    if (upperSql.startsWith('INSERT INTO CORE.PARAMETROS_SISTEMA')) {
      const [clubId, modulo, clave, valor, tipoValor, titulo, descripcion, estado, esEditable] = params;
      const newParam = {
        id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        club_id: clubId || null,
        modulo: (modulo || 'GENERAL').toUpperCase(),
        clave: (clave || '').toUpperCase(),
        valor: valor || '',
        tipo_valor: tipoValor || 'STRING',
        titulo: titulo || '',
        descripcion: descripcion || null,
        estado: estado !== undefined ? estado : true,
        es_editable: esEditable !== undefined ? esEditable : true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.memoryStore.parametros_sistema.push(newParam);
      return this.wrapResult([newParam as unknown as T], 1);
    }

    // 15. UPDATE PARAMETRO SISTEMA
    if (upperSql.startsWith('UPDATE CORE.PARAMETROS_SISTEMA')) {
      const id = params[0];
      const param = (this.memoryStore.parametros_sistema || []).find(p => p.id === id);
      if (param) {
        param.valor = params[1] !== undefined ? params[1] : param.valor;
        if (params.length > 2) param.titulo = params[2];
        if (params.length > 3) param.descripcion = params[3];
        if (params.length > 4) param.estado = params[4];
        param.updated_at = new Date();
        return this.wrapResult([param as unknown as T], 1);
      }
      return this.wrapResult([], 0);
    }

    // 16. DELETE PARAMETRO SISTEMA
    if (upperSql.startsWith('DELETE FROM CORE.PARAMETROS_SISTEMA')) {
      const id = params[0];
      const idx = (this.memoryStore.parametros_sistema || []).findIndex(p => p.id === id);
      if (idx >= 0) {
        this.memoryStore.parametros_sistema.splice(idx, 1);
        return this.wrapResult([{ id }] as unknown as T[], 1);
      }
      return this.wrapResult([], 0);
    }

    // Default: return empty or generic match
    return this.wrapResult([] as unknown as T[]);
  }

  private wrapResult<T extends QueryResultRow>(rows: T[], rowCount?: number): QueryResult<T> {
    return {
      rows,
      command: 'SELECT',
      rowCount: rowCount !== undefined ? rowCount : rows.length,
      oid: 0,
      fields: [],
    };
  }

  // ==========================================================================
  // INICIALIZADOR DE DATOS SEMILLA EN MEMORIA
  // ==========================================================================
  private initMemoryStore() {
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
          password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', // sportcore2026
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
          password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', // sportcore2026
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
          password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', // sportcore2026
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
          password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', // sportcore2026
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
          password_hash: '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', // sportcore2026
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
      parametros_sistema: [
        {
          id: 'e0000000-0000-0000-0000-000000000001',
          club_id: null,
          modulo: 'DEPORTIVO',
          clave: 'CATALOGO_EPS',
          valor: JSON.stringify([
            { codigo: 'SURA', nombre: 'SURA EPS', tipo: 'EPS_CONTRIBUTIVO' },
            { codigo: 'SANITAS', nombre: 'Sanitas EPS', tipo: 'EPS_CONTRIBUTIVO' },
            { codigo: 'COMPENSAR', nombre: 'Compensar EPS', tipo: 'EPS_CONTRIBUTIVO' },
            { codigo: 'SALUD_TOTAL', nombre: 'Salud Total EPS', tipo: 'EPS_CONTRIBUTIVO' },
            { codigo: 'NUEVA_EPS', nombre: 'Nueva EPS', tipo: 'EPS_MIXTO' },
            { codigo: 'FAMISANAR', nombre: 'Famisanar EPS', tipo: 'EPS_CONTRIBUTIVO' },
            { codigo: 'SOS', nombre: 'EPS S.O.S', tipo: 'EPS_CONTRIBUTIVO' },
            { codigo: 'COOSALUD', nombre: 'Coosalud EPS', tipo: 'EPS_SUBSIDIADO' },
            { codigo: 'MUTUAL_SER', nombre: 'Mutual Ser', tipo: 'EPS_SUBSIDIADO' },
            { codigo: 'CAPITAL_SALUD', nombre: 'Capital Salud EPS', tipo: 'EPS_SUBSIDIADO' },
            { codigo: 'ASMET_SALUD', nombre: 'Asmet Salud EPS', tipo: 'EPS_SUBSIDIADO' },
            { codigo: 'SAVIA_SALUD', nombre: 'Savia Salud EPS', tipo: 'EPS_SUBSIDIADO' },
            { codigo: 'PREPAGADA_POLIZA', nombre: 'Póliza Médica Privada / Prepagada', tipo: 'POLIZA_PRIVADA' },
            { codigo: 'OTRA_EPS', nombre: 'Particular / Otra EPS no listada', tipo: 'OTRO' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Catálogo Oficial de Entidades EPS y Seguros Médicos',
          descripcion: 'Listado de entidades promotoras de salud y aseguradoras médicas autorizadas para la ficha del jugador.',
          estado: true,
          es_editable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000002',
          club_id: null,
          modulo: 'CORE',
          clave: 'TIPOS_DOCUMENTO',
          valor: JSON.stringify([
            { codigo: 'TI', nombre: 'Tarjeta de Identidad (TI)', icono: '🪪' },
            { codigo: 'RC', nombre: 'Registro Civil (RC)', icono: '📄' },
            { codigo: 'CC', nombre: 'Cédula de Ciudadanía (CC)', icono: '💳' },
            { codigo: 'CE', nombre: 'Cédula de Extranjería (CE)', icono: '🌍' },
            { codigo: 'PASAPORTE', nombre: 'Pasaporte Internacional', icono: '✈️' },
            { codigo: 'PEP', nombre: 'Permiso Especial Permanencia (PEP)', icono: '📜' },
            { codigo: 'PPT', nombre: 'Permiso Protección Temporal (PPT)', icono: '📑' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Tipos de Documento de Identidad',
          descripcion: 'Documentos de identidad válidos para jugadores, acudientes y personal del club.',
          estado: true,
          es_editable: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000003',
          club_id: null,
          modulo: 'DEPORTIVO',
          clave: 'PARENTESCOS_ACUDIENTE',
          valor: JSON.stringify([
            { codigo: 'PADRE', nombre: 'Padre' },
            { codigo: 'MADRE', nombre: 'Madre' },
            { codigo: 'TUTOR_LEGAL', nombre: 'Tutor Legal' },
            { codigo: 'ABUELO_A', nombre: 'Abuelo / Abuela' },
            { codigo: 'TIO_A', nombre: 'Tío / Tía' },
            { codigo: 'HERMANO_A', nombre: 'Hermano / Hermana' },
            { codigo: 'OTRO', nombre: 'Otro Familiar / Acudiente' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Catálogo de Parentescos Familiares',
          descripcion: 'Relaciones familiares permitidas para los acudientes y tutores de los deportistas.',
          estado: true,
          es_editable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000004',
          club_id: null,
          modulo: 'DEPORTIVO',
          clave: 'POSICIONES_JUGADOR',
          valor: JSON.stringify([
            { codigo: 'POR', nombre: 'Portero / Guardameta (POR)', linea: 'ARQUERO' },
            { codigo: 'LD', nombre: 'Lateral Derecho (LD)', linea: 'DEFENSA' },
            { codigo: 'DFC', nombre: 'Defensa Central (DFC)', linea: 'DEFENSA' },
            { codigo: 'LI', nombre: 'Lateral Izquierdo (LI)', linea: 'DEFENSA' },
            { codigo: 'MCD', nombre: 'Volante de Marca / Pivote (MCD)', linea: 'MEDIOCAMPO' },
            { codigo: 'MC', nombre: 'Volante Mixto / Interior (MC)', linea: 'MEDIOCAMPO' },
            { codigo: 'MCO', nombre: 'Volante Creativo / Enganche (MCO)', linea: 'MEDIOCAMPO' },
            { codigo: 'ED', nombre: 'Extremo Derecho (ED)', linea: 'ATAQUE' },
            { codigo: 'EI', nombre: 'Extremo Izquierdo (EI)', linea: 'ATAQUE' },
            { codigo: 'DC', nombre: 'Delantero Centro / 9 (DC)', linea: 'ATAQUE' },
            { codigo: 'SD', nombre: 'Segundo Delantero (SD)', linea: 'ATAQUE' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Posiciones Tácticas en Cancha',
          descripcion: 'Catálogo estándar de demarcaciones futbolísticas para la ficha deportiva y convocatorias.',
          estado: true,
          es_editable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000005',
          club_id: null,
          modulo: 'DEPORTIVO',
          clave: 'PIERNAS_HABILES',
          valor: JSON.stringify([
            { codigo: 'DIESTRO', nombre: 'Diestro (Pie Derecho)' },
            { codigo: 'ZURDO', nombre: 'Zurdo (Pie Izquierdo)' },
            { codigo: 'AMBIDIESTRO', nombre: 'Ambidiestro (Ambos Pies)' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Perfiles de Pierna Hábil',
          descripcion: 'Perfil de lateralidad del jugador para informes técnicos y scouting.',
          estado: true,
          es_editable: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000006',
          club_id: null,
          modulo: 'COMPETICION',
          clave: 'KITS_INDUMENTARIA',
          valor: JSON.stringify([
            { codigo: 'KIT_TITULAR', nombre: 'Kit Titular (Esmeralda Pro)' },
            { codigo: 'KIT_ALTERNO', nombre: 'Kit Alterno (Blanco Élite)' },
            { codigo: 'KIT_TERCERO', nombre: 'Kit Tercero (Negro / Dorado)' },
            { codigo: 'KIT_PORTERO', nombre: 'Kit Portero (Amarillo Neón)' },
            { codigo: 'PETO_ENTRENAMIENTO', nombre: 'Peto de Entrenamiento Fluo' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Kits de Indumentaria para Partidos',
          descripcion: 'Equipaciones de juego disponibles para la programación de partidos y actas.',
          estado: true,
          es_editable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000007',
          club_id: null,
          modulo: 'RENDIMIENTO',
          clave: 'DISPOSITIVOS_GPS',
          valor: JSON.stringify([
            { codigo: 'CATAPULT_10HZ', nombre: 'Catapult Vector / ClearSky (10Hz)' },
            { codigo: 'POLAR_TEAM_PRO', nombre: 'Polar Team Pro (10Hz)' },
            { codigo: 'STATSPORTS_APEX', nombre: 'STATSports Apex Pro' },
            { codigo: 'K_SPORT_10HZ', nombre: 'K-Sport Live Tracking' },
            { codigo: 'WIMU_PRO', nombre: 'RealTrack WIMU PRO' },
            { codigo: 'GPS_GENERICO', nombre: 'Sensor GPS / Wearable Genérico' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Dispositivos y Sensores GPS Compatibles',
          descripcion: 'Marcas y especificaciones de telemetría deportiva homologadas.',
          estado: true,
          es_editable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e0000000-0000-0000-0000-000000000008',
          club_id: null,
          modulo: 'OPERACIONES',
          clave: 'TIPOS_SUPERFICIE_CANCHA',
          valor: JSON.stringify([
            { codigo: 'sintetica_f5', nombre: 'Sintética Fútbol 5' },
            { codigo: 'sintetica_f8', nombre: 'Sintética Fútbol 8' },
            { codigo: 'natural_f11', nombre: 'Grama Natural Fútbol 11' },
            { codigo: 'futsal_madera', nombre: 'Coliseo Madera Futsal' },
            { codigo: 'arena_futbol', nombre: 'Cancha de Arena / Playa' },
          ]),
          tipo_valor: 'JSON',
          titulo: 'Tipos de Superficie de Cancha',
          descripcion: 'Catálogo de terrenos de juego e instalaciones deportivas.',
          estado: true,
          es_editable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    };
  }
}
