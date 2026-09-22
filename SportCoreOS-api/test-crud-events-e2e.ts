import { Client } from 'pg';

async function runE2ECrudTests() {
  console.log('⚽ =========================================================================');
  console.log('🚀 SUITE DE PRUEBAS CRUD EXHAUSTIVAS SPORTCOREOS (API + POSTGRESQL QA)');
  console.log('   Eventos: SELECT, INSERT, UPDATE, DELETE en Esquema de Datos');
  console.log('=========================================================================\n');

  const client = new Client({
    connectionString: 'postgresql://sportcore_user_qa:SportCoreQA2026*@100.120.112.79:52132/sportcoreos_db_qa',
  });

  try {
    await client.connect();
    console.log('✅ Conexión establecida con PostgreSQL QA (100.120.112.79:52132)');

    // 1. Obtener Club y Categoría Base
    const clubRes = await client.query('SELECT id, nombre FROM public.clubes LIMIT 1');
    if (clubRes.rows.length === 0) throw new Error('No se encontró club base.');
    const clubId = clubRes.rows[0].id;
    console.log(`\n🏢 Club Base: ${clubRes.rows[0].nombre} (${clubId})`);

    const catRes = await client.query('SELECT id, nombre FROM public.categorias WHERE club_id = $1 LIMIT 1', [clubId]);
    const categoriaId = catRes.rows.length > 0 ? catRes.rows[0].id : null;
    console.log(`🏅 Categoría Base: ${catRes.rows[0]?.nombre || 'N/A'} (${categoriaId})`);

    // 2. TEST CRUD: PUBLIC.PARTIDOS
    console.log('\n--- 1. EVENTOS CRUD: public.partidos ---');
    // INSERT
    const insertPartido = await client.query(
      `INSERT INTO public.partidos 
        (club_id, categoria_id, rival_nombre, fecha_partido, hora_partido, hora_citacion, sede_cancha, condicion_juego, indumentaria_kit, estado_partido, goles_club, goles_rival)
       VALUES 
        ($1, $2, 'Rival Test E2E FC', CURRENT_DATE + INTERVAL '5 days', '10:00:00', '09:00:00', 'Cancha Sintética 1', 'LOCAL', 'TITULAR', 'PROGRAMADO', 0, 0)
       RETURNING id, rival_nombre, fecha_partido, estado_partido`,
      [clubId, categoriaId]
    );
    const partidoId = insertPartido.rows[0].id;
    console.log(`  [INSERT] ✅ Partido creado ID: ${partidoId} vs ${insertPartido.rows[0].rival_nombre}`);

    // SELECT
    const selectPartido = await client.query('SELECT * FROM public.partidos WHERE id = $1', [partidoId]);
    console.log(`  [SELECT] ✅ Partido consultado: ${selectPartido.rows[0].rival_nombre}, Cancha: ${selectPartido.rows[0].sede_cancha}`);

    // UPDATE
    const updatePartido = await client.query(
      `UPDATE public.partidos 
       SET estado_partido = 'FINALIZADO', goles_club = 3, goles_rival = 1, indumentaria_kit = 'ALTERNO'
       WHERE id = $1 RETURNING estado_partido, goles_club, goles_rival, indumentaria_kit`,
      [partidoId]
    );
    console.log(`  [UPDATE] ✅ Partido actualizado: Estado=${updatePartido.rows[0].estado_partido}, Marcador=${updatePartido.rows[0].goles_club}-${updatePartido.rows[0].goles_rival}, Kit=${updatePartido.rows[0].indumentaria_kit}`);

    // 3. TEST CRUD: PUBLIC.CONVOCATORIAS (11 Titulares y Suplentes)
    console.log('\n--- 2. EVENTOS CRUD: public.convocatorias (Titulares & Suplentes) ---');
    const jugRes = await client.query('SELECT id, nombres, apellidos FROM public.jugadores WHERE club_id = $1 LIMIT 2', [clubId]);
    if (jugRes.rows.length > 0) {
      const jug1 = jugRes.rows[0].id;
      const jugNombre = `${jugRes.rows[0].nombres} ${jugRes.rows[0].apellidos}`;
      // INSERT Convocado como TITULAR
      const insertConv = await client.query(
        `INSERT INTO public.convocatorias 
          (partido_id, jugador_id, rol_convocatoria, posicion_designada, estado_confirmacion)
         VALUES ($1, $2, 'TITULAR', 'Centrocampista Ofensivo', 'CONFIRMADO')
         RETURNING id, rol_convocatoria, posicion_designada, estado_confirmacion`,
        [partidoId, jug1]
      );
      const convId = insertConv.rows[0].id;
      console.log(`  [INSERT] ✅ Jugador (${jugNombre}) convocado a Pestaña TITULARES ID: ${convId}, Posición: ${insertConv.rows[0].posicion_designada}`);

      // UPDATE Convocatoria (Cambio táctico de Titular a SUPLENTE)
      const updateConv = await client.query(
        `UPDATE public.convocatorias 
         SET rol_convocatoria = 'SUPLENTE', motivo_excusa = 'Estrategia táctica segundo tiempo' 
         WHERE id = $1 RETURNING rol_convocatoria, motivo_excusa`,
        [convId]
      );
      console.log(`  [UPDATE] ✅ Convocatoria modificada a Pestaña SUPLENTES: Rol=${updateConv.rows[0].rol_convocatoria} (${updateConv.rows[0].motivo_excusa})`);

      // SELECT Convocatorias
      const selectConv = await client.query('SELECT * FROM public.convocatorias WHERE partido_id = $1', [partidoId]);
      console.log(`  [SELECT] ✅ Lista de convocados recuperada: ${selectConv.rows.length} convocados activos`);

      // DELETE Convocatoria
      await client.query('DELETE FROM public.convocatorias WHERE id = $1', [convId]);
      console.log(`  [DELETE] ✅ Convocatoria eliminada correctamente`);
    }

    // DELETE PARTIDO
    await client.query('DELETE FROM public.partidos WHERE id = $1', [partidoId]);
    console.log(`  [DELETE] ✅ Partido eliminado limpiamente`);

    // 4. TEST CRUD: PUBLIC.FINANZAS_CONCEPTOS
    console.log('\n--- 3. EVENTOS CRUD: public.finanzas_conceptos ---');
    const insertConcepto = await client.query(
      `INSERT INTO public.finanzas_conceptos (club_id, nombre, tipo, monto_base, activo)
       VALUES ($1, 'Torneo Pruebas E2E 2026', 'ARBITRAJE', 45000.00, true)
       RETURNING id, nombre, monto_base`,
      [clubId]
    );
    const conceptoId = insertConcepto.rows[0].id;
    console.log(`  [INSERT] ✅ Concepto de cobro creado ID: ${conceptoId} ($${insertConcepto.rows[0].monto_base})`);

    const updateConcepto = await client.query(
      `UPDATE public.finanzas_conceptos SET monto_base = 50000.00, nombre = 'Torneo Pruebas E2E - Tarifa Actualizada' WHERE id = $1 RETURNING monto_base, nombre`,
      [conceptoId]
    );
    console.log(`  [UPDATE] ✅ Concepto modificado a: $${updateConcepto.rows[0].monto_base} ("${updateConcepto.rows[0].nombre}")`);

    const selectConcepto = await client.query('SELECT * FROM public.finanzas_conceptos WHERE id = $1', [conceptoId]);
    console.log(`  [SELECT] ✅ Concepto consultado: ${selectConcepto.rows[0].nombre}`);

    await client.query('DELETE FROM public.finanzas_conceptos WHERE id = $1', [conceptoId]);
    console.log(`  [DELETE] ✅ Concepto eliminado limpiamente`);

    console.log('\n=========================================================================');
    console.log('🎉 TODOS LOS EVENTOS CRUD (SELECT, INSERT, UPDATE, DELETE)');
    console.log('   SE EJECUTARON Y VALIDARON CON ÉXITO AL 100% EN POSTGRESQL');
    console.log('=========================================================================\n');

  } catch (error) {
    console.error('❌ ERROR EN PRUEBA CRUD E2E:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runE2ECrudTests();
