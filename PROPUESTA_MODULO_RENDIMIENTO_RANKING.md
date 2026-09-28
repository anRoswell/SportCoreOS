# Propuesta del módulo Rendimiento / Ranking

**SportCoreOS · Versión 0.1 · 27 de septiembre de 2026**

## 1. Propósito

Crear una experiencia de formación y competencia que motive a los deportistas a jugar, aprender y progresar. El módulo combina retos y XP, desarrollo de habilidades observables, estadísticas deportivas y rankings apropiados para cada contexto.

La primera etapa se centra en escuelas y clubes. La arquitectura debe permitir incorporar ligas de ciudad posteriormente, sin que la captura de estadísticas de liga dependa de que la pantalla o el plan comercial de ese submódulo esté habilitado.

## 2. Principios de diseño

- **Desarrollo antes que selección:** el ranking debe incentivar la participación y el progreso, no etiquetar a niños como buenos o malos.
- **Juego real como centro:** las habilidades se enseñan y evalúan en situaciones de juego, no solo con cuestionarios o ejercicios aislados.
- **Comparaciones justas:** mostrar rankings por categoría, periodo y contexto; interpretar estadísticas considerando minutos, oportunidades y rol.
- **Personalización flexible:** la categoría orienta la complejidad; la posición ofrece variantes; la observación del DT define el foco individual. La posición no debe encasillar al jugador, especialmente en edades tempranas.
- **Transparencia:** cada XP, estadística, evaluación y desempate debe tener una definición conocida y un origen verificable.
- **Protección de menores:** los perfiles de aprendizaje y las necesidades individuales son privados. El ranking público no muestra “debilidades”.

## 3. Estructura propuesta: tres submódulos

### 3.1 Juego

Su objetivo es hacer que el estudiante vuelva, explore y aprenda.

- Retos, misiones, niveles, insignias y experiencia (XP).
- Lecciones audiovisuales e interactivas con escenas distintas según la pregunta o decisión.
- Actividades de cancha conectadas con la lección y una pauta para que el DT observe su aplicación.
- Progreso personal y metas alcanzables; recompensas por práctica, aprendizaje y mejora, no solo por ganar.
- XP educativo separado del XP obtenido por estadísticas oficiales. La fórmula debe poder explicarse y configurarse.

### 3.2 Club / Escuela

Es la primera vista de ranking competitivo: compara a los estudiantes dentro de su escuela, club y categoría.

- Ranking por periodo y categoría, con ficha de progreso individual.
- Resumen de aportes ofensivos, defensivos y de portería, además de la participación en retos.
- Filtros por temporada, categoría, posición y tipo de competencia cuando esos datos sean confiables.
- Separación entre **rendimiento estadístico** y **desarrollo de habilidades**: no se debe resumir todo en una única puntuación opaca.

### 3.3 Liga

Prepara la expansión a ligas de ciudad y sus competencias.

- Captura manual de actas y estadísticas por partido.
- Importación CSV con plantilla, vista previa, validaciones, asociación de jugadores y control de duplicados.
- Ranking por liga, temporada, categoría, equipo y jugador.
- Historial del origen del dato —manual, CSV o integración— y estado de revisión.
- La recepción y conservación de datos de liga debe ser independiente del indicador de disponibilidad comercial de la interfaz. Habilitar una pantalla no debe ser requisito para recibir/importar las estadísticas autorizadas.

## 4. ¿Qué se mide?

Los indicadores deben estar definidos por evento y guardar contexto. Las estadísticas son evidencias parciales del juego; por sí solas no diagnostican una necesidad individual.

| Área | Indicadores iniciales | Contexto necesario |
|---|---|---|
| Ataque | Goles, asistencias, remates, remates al arco, pases clave, regates exitosos | Minutos, posición, partido y oportunidades |
| Defensa | Recuperaciones, intercepciones, duelos y entradas exitosas | Rol, zona, fase de juego y oportunidades observadas |
| Portería | Atajadas, goles recibidos y acciones de distribución | Minutos en portería, remates enfrentados y categoría |
| Aprendizaje | Lecciones y retos completados, decisiones razonadas, práctica realizada | Habilidad y etapa de aprendizaje asociadas |
| Desarrollo en cancha | Escaneo antes de recibir, perfil corporal, orientación del primer toque y aplicación bajo presión | Rúbrica del DT, oportunidades observadas y comparación del jugador consigo mismo |

Para los rankings estadísticos se recomienda mostrar los valores base y permitir filtros pertinentes; no comparar, por ejemplo, los goles de un delantero con las atajadas de un arquero mediante una fórmula única sin explicación. Indicadores de asistencia, esfuerzo o convivencia pueden servir para acompañar al deportista, pero no deberían transformarse en etiquetas subjetivas públicas.

## 5. Metodología formativa propuesta

La ruta digital y de cancha se organiza así:

**Observar en juego → elegir un foco → aprender → practicar → aplicar en juego → revisar.**

El DT observa conductas en un juego reducido, define uno o dos focos concretos, asigna una lección y un reto de cancha, y vuelve a observar la habilidad en un contexto de juego. La aplicación puede recomendar contenidos, pero el DT valida el foco.

La estructura de sesión se adapta a la edad y experiencia:

- Para los más pequeños, tomar como referencia **Jugar–Practicar–Jugar**.
- Para una etapa como 8–12 años, puede usarse **Global–Analítico–Global**: situación de juego, repetición técnica enfocada y retorno al juego.
- Para jugadores mayores o con más experiencia, progresar de acción individual a situación táctica y luego a fase de juego.

La posición se trata como una variante contextual. En edades tempranas se prioriza experimentar distintas funciones; conforme avanza el desarrollo se agregan objetivos específicos por rol.

## 6. Piloto inicial de cuatro semanas

**Categoría de referencia:** 8–12 años, ajustable a las categorías reales de la escuela.  
**Tema:** recibir y salir de la presión.  
**Objetivo:** que el jugador perciba el entorno, se oriente y use el primer toque para conservar el balón o salir hacia un espacio útil.

| Semana | Foco y actividad | Evidencia a observar |
|---|---|---|
| 1. Punto de partida | Juego reducido 3v1; observar antes de corregir excesivamente | Oportunidades de escaneo, perfil corporal y primer toque |
| 2. Escanear | Identificar rival y espacio antes de que llegue el pase; lección interactiva, primera decisión | ¿Mira alrededor antes del contacto? |
| 3. Orientar el control | Recibir y salir por una puerta libre; añadir presión de forma gradual; segunda escena y reto | ¿El toque mantiene el control y habilita la siguiente acción? |
| 4. Transferir al juego | Aplicar el foco en 3v3 o 4v4 y repetir la observación inicial | Comparación del deportista consigo mismo, considerando oportunidades |

### Rúbrica inicial del DT

Observar las mismas tres conductas en semanas 1 y 4:

1. **Escaneo:** mira alrededor antes de que llegue el pase.
2. **Perfil corporal:** se orienta para ver el balón y una opción de salida.
3. **Primer toque:** mantiene el control y lleva el balón hacia el espacio útil.

Escala orientativa: **lo intenta con guía → lo aplica en algunas oportunidades → lo aplica en el juego sin recordatorio**. Registrar el número de oportunidades observadas cuando sea posible. La rúbrica sirve para orientar la enseñanza, no para publicar un ranking de habilidades.

El piloto debe ejecutarse con una escuela, un grupo y un DT definidos. La interfaz actual presenta la secuencia y la rúbrica, pero todavía no captura ni persiste una evaluación individual de línea base y cierre.

## 7. Plan anual y ciclos de trabajo

Conviene diseñar un mapa anual de objetivos, no una sesión única que se repita todo el año. El calendario debe ajustarse a la frecuencia real de entrenamiento, vacaciones, partidos y eventos de la escuela.

Como unidad de planificación inicial se proponen bloques revisables de 4–6 semanas:

1. Definir tema, categoría y habilidad observable.
2. Elegir lecciones, escenas y actividades de cancha.
3. Acordar la rúbrica y el tipo de evidencia.
4. Revisar resultados con el DT al final del bloque.
5. Ajustar el siguiente bloque según lo observado.

La duración de 4–6 semanas es una propuesta operativa para validar en el piloto, no una prescripción oficial de FIFA.

## 8. Hoja de ruta de producto

### Fase A — Validar el piloto escolar

- Confirmar escuela, grupo, edades, posiciones y calendario.
- Afinar matriz de habilidades, indicadores y rúbrica con DT/educadores.
- Ejecutar y revisar el bloque de cuatro semanas.
- Separar aprendizaje real en cancha de métricas de uso digital.

### Fase B — Juego

- Consolidar catálogo de lecciones, escenas diferenciadas y retos.
- Configurar niveles, XP, insignias y recompensas con reglas transparentes.
- Probar interacción, accesibilidad, contenido por categoría y errores del cliente.

### Fase C — Club / Escuela

- Publicar rankings escolares por categoría y periodo.
- Incorporar estadísticas verificadas y vistas de progreso privado.
- Validar filtros, trazabilidad, reglas de XP y desempates.

### Fase D — Liga

- Añadir captura manual e importación CSV con validaciones y auditoría.
- Asegurar que importar/recibir información no dependa de activar el submódulo visual.
- Después, evaluar integraciones con ligas y rankings entre ciudades.

## 9. Reglas técnicas, pruebas y datos

- **Arranque sin escrituras a BD:** iniciar la aplicación no debe ejecutar `INSERT`, `UPDATE`, `ALTER` ni `DELETE`. Tampoco debe correr migraciones, seeds ni creación/modificación automática de estructuras en el arranque.
- Los cambios de esquema futuros deben prepararse y ejecutarse mediante un proceso explícito y controlado, no como efecto secundario de iniciar el servidor.
- Las operaciones de usuario sobre actas, estadísticas o evaluaciones deben ser explícitas, autorizadas y auditables.
- Para las acciones que persistan datos, verificar en pruebas la persistencia y las relaciones/llaves foráneas.
- Las pruebas E2E deben adjuntar el sniffer estricto de JavaScript, consola y HTTP, recorrer controles y flujos completos, y evitar pruebas superficiales.
- La importación CSV debe tener vista previa y validación antes de confirmar; los errores deben identificar la fila/campo sin crear registros parciales.
- Definir permisos para jugador, DT, director y administrador; proteger especialmente los datos de menores.

## 10. Estado del prototipo

- Existe una lección interactiva para **“Control orientado para salir de la presión”**, con dos escenas específicas: escaneo antes de recibir y elección del primer toque.
- Se muestra un mapa de cuatro semanas y una rúbrica descriptiva para el DT.
- El E2E del recorrido de la lección pasó con API simulada y sniffer estricto.
- La rúbrica todavía no registra mediciones por jugador ni compara automáticamente semana 1 con semana 4.
- El piloto de cancha aún no se ha realizado con una escuela y participantes definidos.

## 11. Referentes deportivos

Usar estos materiales como referencias metodológicas y crear contenido propio. No reutilizar videos, imágenes o materiales de terceros sin autorización.

- [FIFA Training Centre — Fútbol base](https://www.fifatrainingcentre.com/en/practice/grassroots.php): prácticas y orientación organizada por etapas de edad.
- [FIFA Football for Schools — Learning through football](https://legal.fifa.com/advancing-football/football-for-schools/learning-through-football): recursos y actividades pensados para el entorno escolar, con desarrollo futbolístico y habilidades para la vida.
- [FIFA — Jugar–Practicar–Jugar](https://www.fifatrainingcentre.com/es/practice/grassroots/grassroots-and-youth-football-essentials/grassroots-coaching-essentials/an-introduction-to-play-practice-play.php).
- [FIFA — Global–Analítico–Global para 8–12 años](https://www.fifatrainingcentre.com/es/practice/grassroots/grassroots-and-youth-football-essentials/grassroots-coaching-essentials/coaching-with-the-global-analytical-global-model.php).
- [FIFA — Metodología progresiva para 12–15 años](https://www.fifatrainingcentre.com/en/practice/grassroots/grassroots-and-youth-football-essentials/grassroots-coaching-essentials/introduction-to-the-progressive-methodology.php).
- [FIFA — Desarrollo mediante entrenamiento específico por posición](https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/position-specific-training/developing-players-using-position-specific-training.php).
- [Federación Colombiana de Fútbol — Formación de categorías juveniles](https://fcf.com.co/2026/07/11/la-base-de-las-selecciones-colombia-se-prepara-en-todas-sus-categorias/): referencia local sobre equilibrio entre lo técnico, táctico, físico y formativo.

## 12. Decisiones pendientes

- Escuela/grupo y responsable del primer piloto.
- Categorías oficiales y formatos de juego que utiliza la escuela.
- Frecuencia de sesiones y calendario del año.
- Recompensas del juego y reglas de XP.
- Métricas oficiales disponibles por partido y responsable de validarlas.
- Permisos, acceso familiar, conservación de datos y publicación de rankings.
- Forma de registrar las rúbricas iniciales y finales una vez aprobada la política de datos y el modelo de persistencia.
