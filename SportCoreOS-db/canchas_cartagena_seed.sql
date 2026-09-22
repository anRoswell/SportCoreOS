-- ============================================================================
-- SPORTCOREOS — DIRECTORIO DE CANCHAS Y ESCENARIOS DEPORTIVOS DE CARTAGENA
-- Tabla Maestra y Catálogo Geolocalizado con Coordenadas GPS, Localidad y Waze
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.canchas_cartagena (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    nombre_comun VARCHAR(100),
    localidad VARCHAR(80) NOT NULL, -- Localidad 1, 2, 3 o Corregimientos
    barrio VARCHAR(80) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    referencia_ubicacion VARCHAR(250),
    tipo_escenario VARCHAR(40) NOT NULL DEFAULT 'PUBLICO_IDER', -- PUBLICO_IDER, PRIVADO_COMERCIAL, COMPLEJO_DEPORTIVO, ESTADIO_OFICIAL, CLUB_CAMPESTRE
    tipo_superficie VARCHAR(40) NOT NULL DEFAULT 'SINTETICA', -- SINTETICA, CESPED_NATURAL, ARENA, CONCRETO_FUTSAL
    formato_principal VARCHAR(30) NOT NULL DEFAULT 'FUTBOL_11', -- FUTBOL_11, FUTBOL_9, FUTBOL_8, FUTBOL_7, FUTBOL_5
    latitud NUMERIC(10, 7) NOT NULL,
    longitud NUMERIC(10, 7) NOT NULL,
    google_maps_url TEXT,
    waze_url TEXT,
    tiene_iluminacion BOOLEAN DEFAULT true,
    tiene_graderias BOOLEAN DEFAULT false,
    tiene_camerinos BOOLEAN DEFAULT false,
    tiene_parqueadero BOOLEAN DEFAULT false,
    es_techada BOOLEAN DEFAULT false,
    capacidad_espectadores INTEGER DEFAULT 0,
    administrado_por VARCHAR(80) DEFAULT 'IDER Cartagena',
    telefono_contacto VARCHAR(40),
    estado VARCHAR(30) DEFAULT 'OPERATIVA', -- OPERATIVA, MANTENIMIENTO, REMODELACION
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_canchas_ctg_localidad ON public.canchas_cartagena(localidad);
CREATE INDEX IF NOT EXISTS idx_canchas_ctg_barrio ON public.canchas_cartagena(barrio);
CREATE INDEX IF NOT EXISTS idx_canchas_ctg_superficie ON public.canchas_cartagena(tipo_superficie);
CREATE INDEX IF NOT EXISTS idx_canchas_ctg_coords ON public.canchas_cartagena(latitud, longitud);

-- ----------------------------------------------------------------------------
-- INSERCIÓN DE CANCHAS Y COMPLEJOS DEPORTIVOS DE CARTAGENA DE INDIAS
-- ----------------------------------------------------------------------------

INSERT INTO public.canchas_cartagena (
    nombre, nombre_comun, localidad, barrio, direccion, referencia_ubicacion,
    tipo_escenario, tipo_superficie, formato_principal, latitud, longitud,
    google_maps_url, waze_url, tiene_iluminacion, tiene_graderias, tiene_camerinos, tiene_parqueadero,
    capacidad_espectadores, administrado_por
) VALUES

-- ============================================================================
-- ESTADIOS & COMPLEJOS PRINCIPALES DE CARTAGENA
-- ============================================================================
(
    'Estadio Olímpico Jaime Morón León', 'El Nido Amarillo',
    'Localidad 2: De la Virgen y Turística', 'Olaya Herrera / Villa Olímpica',
    'Av. Pedro de Heredia, Villa Olímpica', 'Frente a estación Transcaribe Villa Olímpica',
    'ESTADIO_OFICIAL', 'CESPED_NATURAL', 'FUTBOL_11', 10.3970420, -75.4940180,
    'https://maps.google.com/?q=10.397042,-75.494018', 'https://waze.com/ul?ll=10.397042,-75.494018&navigate=yes',
    true, true, true, true, 16000, 'IDER / Gobernación de Bolívar'
),
(
    'Complejo Deportivo Departamental Rocky Valdez', 'Parque de Atletismo y Fútbol',
    'Localidad 3: Industrial y de la Bahía', 'El Pozón / Vía a Turbaco',
    'Carretera Troncal de Occidente Km 1', 'Diagonal a Ciudad Bicentenario',
    'COMPLEJO_DEPORTIVO', 'SINTETICA', 'FUTBOL_11', 10.3650200, -75.4580400,
    'https://maps.google.com/?q=10.365020,-75.458040', 'https://waze.com/ul?ll=10.365020,-75.458040&navigate=yes',
    true, true, true, true, 2500, 'Iderbol / IDER'
),
(
    'Cancha de Fútbol San Francisco de Asís (Villa Olímpica)', 'Cancha Auxiliar Villa Olímpica',
    'Localidad 2: De la Virgen y Turística', 'Villa Olímpica',
    'Calle 31 # 55-20, Villa Olímpica', 'Detrás del Coliseo Bernardo Caraballo',
    'COMPLEJO_DEPORTIVO', 'SINTETICA', 'FUTBOL_11', 10.3982100, -75.4955300,
    'https://maps.google.com/?q=10.398210,-75.495530', 'https://waze.com/ul?ll=10.398210,-75.495530&navigate=yes',
    true, true, true, true, 1200, 'IDER Cartagena'
),

-- ============================================================================
-- LOCALIDAD 1: HISTÓRICA Y DEL CARIBE NORTE
-- ============================================================================
(
    'Cancha de Fútbol Canapote', 'Cancha de Canapote',
    'Localidad 1: Histórica y del Caribe Norte', 'Canapote',
    'Calle 61 con Carrera 14, Canapote', 'Cerca al caño Juan Angola',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.4358200, -75.5242100,
    'https://maps.google.com/?q=10.435820,-75.524210', 'https://waze.com/ul?ll=10.435820,-75.524210&navigate=yes',
    true, true, false, false, 400, 'IDER Cartagena / Junta Comunal'
),
(
    'Cancha San Francisco', 'Cancha Principal San Francisco',
    'Localidad 1: Histórica y del Caribe Norte', 'San Francisco',
    'Carrera 17 con Calle 70, San Francisco', 'Al lado del CAP de San Francisco',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.4305100, -75.5186200,
    'https://maps.google.com/?q=10.430510,-75.518620', 'https://waze.com/ul?ll=10.430510,-75.518620&navigate=yes',
    true, true, true, false, 600, 'IDER Cartagena'
),
(
    'Cancha Daniel Lemaitre', 'El Templo de Daniel Lemaitre',
    'Localidad 1: Histórica y del Caribe Norte', 'Daniel Lemaitre',
    'Calle 68 # 15-40, Daniel Lemaitre', 'Diagonal a la Iglesia Santa Cruz',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_9', 10.4289400, -75.5225100,
    'https://maps.google.com/?q=10.428940,-75.522510', 'https://waze.com/ul?ll=10.428940,-75.522510&navigate=yes',
    true, true, false, false, 350, 'IDER Cartagena'
),
(
    'Cancha Polideportivo de Manga', 'Cancha de Manga',
    'Localidad 1: Histórica y del Caribe Norte', 'Manga',
    'Calle 26 (Av. Miramar) con Carrera 21, Manga', 'Frente a la Bahía de Cartagena',
    'COMPLEJO_DEPORTIVO', 'SINTETICA', 'FUTBOL_8', 10.4128100, -75.5385200,
    'https://maps.google.com/?q=10.412810,-75.538520', 'https://waze.com/ul?ll=10.412810,-75.538520&navigate=yes',
    true, true, true, true, 500, 'IDER Cartagena / Asomanga'
),
(
    'Cancha Sintética Pie de la Popa', 'Cancha Parque de la Popa',
    'Localidad 1: Histórica y del Caribe Norte', 'Pie de la Popa',
    'Calle 30 con Carrera 21, Pie de la Popa', 'A espaldas del Cerro de la Popa',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.4182100, -75.5310200,
    'https://maps.google.com/?q=10.418210,-75.531020', 'https://waze.com/ul?ll=10.418210,-75.531020&navigate=yes',
    true, true, false, true, 300, 'IDER Cartagena'
),
(
    'Cancha de Fútbol Bocagrande (Base Naval / Parque Flanagan)', 'Cancha Bocagrande',
    'Localidad 1: Histórica y del Caribe Norte', 'Bocagrande',
    'Carrera 2 con Calle 6, Bocagrande', 'Contiguo al Parque Flanagan',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_7', 10.3995100, -75.5562100,
    'https://maps.google.com/?q=10.399510,-75.556210', 'https://waze.com/ul?ll=10.399510,-75.556210&navigate=yes',
    true, true, false, true, 250, 'IDER Cartagena'
),
(
    'Cancha Sintética Santa Rita', 'Cancha Santa Rita',
    'Localidad 1: Histórica y del Caribe Norte', 'Santa Rita',
    'Calle 53 con Carrera 14, Santa Rita', 'Cerca a la Ciénaga de la Virgen',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.4245100, -75.5210200,
    'https://maps.google.com/?q=10.424510,-75.521020', 'https://waze.com/ul?ll=10.424510,-75.521020&navigate=yes',
    true, true, false, false, 200, 'IDER Cartagena'
),
(
    'Cancha de Fútbol Paseo Bolívar', 'Cancha de Torices / Paseo Bolívar',
    'Localidad 1: Histórica y del Caribe Norte', 'Paseo Bolívar',
    'Carrera 17 # 47-30, Paseo Bolívar', 'Frente al Parque de la Unión',
    'PUBLICO_IDER', 'ARENA', 'FUTBOL_11', 10.4260200, -75.5290100,
    'https://maps.google.com/?q=10.426020,-75.529010', 'https://waze.com/ul?ll=10.426020,-75.529010&navigate=yes',
    true, true, false, false, 300, 'IDER Cartagena'
),
(
    'Cancha Polideportiva La Boquilla', 'Cancha Comunitaria La Boquilla',
    'Corregimientos / Zona Norte', 'La Boquilla',
    'Calle Principal Sector Marlinda, La Boquilla', 'Cerca a la playa de pescadores',
    'PUBLICO_IDER', 'ARENA', 'FUTBOL_11', 10.4786100, -75.4982100,
    'https://maps.google.com/?q=10.478610,-75.498210', 'https://waze.com/ul?ll=10.478610,-75.498210&navigate=yes',
    true, false, false, true, 200, 'Consejo Comunitario / IDER'
),
(
    'Cancha de Fútbol Manzanillo del Mar', 'Cancha Manzanillo',
    'Corregimientos / Zona Norte', 'Manzanillo del Mar',
    'Entrada principal Manzanillo del Mar', 'Junto al puesto de salud',
    'PUBLICO_IDER', 'CESPED_NATURAL', 'FUTBOL_11', 10.5180100, -75.4850200,
    'https://maps.google.com/?q=10.518010,-75.485020', 'https://waze.com/ul?ll=10.518010,-75.485020&navigate=yes',
    true, false, false, true, 150, 'Comunidad / IDER'
),

-- ============================================================================
-- LOCALIDAD 2: DE LA VIRGEN Y TURÍSTICA
-- ============================================================================
(
    'Cancha de Fútbol Alameda La Victoria', 'El Templo del Fútbol Menor',
    'Localidad 2: De la Virgen y Turística', 'Alameda La Victoria',
    'Manzana 12 frente al Parque Central, Alameda La Victoria', 'Sede oficial Torneo Asefal y Liga de Bolívar',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3895100, -75.4882100,
    'https://maps.google.com/?q=10.389510,-75.488210', 'https://waze.com/ul?ll=10.389510,-75.488210&navigate=yes',
    true, true, true, true, 1500, 'IDER Cartagena'
),
(
    'Cancha de Fútbol Los Calamares (Complejo Deportivo)', 'Cancha de Los Calamares',
    'Localidad 2: De la Virgen y Turística', 'Los Calamares',
    'Manzana 40 con Transversal 54, Los Calamares', 'Al lado del Colegio Departamental',
    'COMPLEJO_DEPORTIVO', 'SINTETICA', 'FUTBOL_11', 10.3980200, -75.4995100,
    'https://maps.google.com/?q=10.398020,-75.499510', 'https://waze.com/ul?ll=10.398020,-75.499510&navigate=yes',
    true, true, true, true, 1000, 'IDER Cartagena'
),
(
    'Cancha de Fútbol San Fernando', 'La Monumental de San Fernando',
    'Localidad 2: De la Virgen y Turística', 'San Fernando',
    'Calle 15 con Carrera 81, San Fernando', 'Frente a la Parroquia San Fernando Rey',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3920100, -75.4890200,
    'https://maps.google.com/?q=10.392010,-75.489020', 'https://waze.com/ul?ll=10.392010,-75.489020&navigate=yes',
    true, true, true, true, 800, 'IDER Cartagena'
),
(
    'Cancha Los Cerros / La Bombonera', 'La Bombonera de Los Cerros',
    'Localidad 2: De la Virgen y Turística', 'Los Cerros',
    'Calle 23 # 48-10, Los Cerros', 'Sector Alto de Los Cerros',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3955100, -75.5210200,
    'https://maps.google.com/?q=10.395510,-75.521020', 'https://waze.com/ul?ll=10.395510,-75.521020&navigate=yes',
    true, true, false, false, 500, 'IDER Cartagena'
),
(
    'Complejo Deportivo La Candelaria', 'Cancha de La Candelaria',
    'Localidad 2: De la Virgen y Turística', 'La Candelaria',
    'Calle 32 con Carrera 38, La Candelaria', 'Cerca a la Vía Perimetral',
    'COMPLEJO_DEPORTIVO', 'SINTETICA', 'FUTBOL_11', 10.4105200, -75.5020100,
    'https://maps.google.com/?q=10.410520,-75.502010', 'https://waze.com/ul?ll=10.410520,-75.502010&navigate=yes',
    true, true, true, true, 700, 'IDER Cartagena'
),
(
    'Cancha de Fútbol El Pozón (Sector Primero de Mayo)', 'Cancha El Pozón Central',
    'Localidad 2: De la Virgen y Turística', 'El Pozón',
    'Calle Las Flores con Carrera 89, El Pozón', 'Cerca al Colegio Camilo Torres',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.4180100, -75.4620200,
    'https://maps.google.com/?q=10.418010,-75.462020', 'https://waze.com/ul?ll=10.418010,-75.462020&navigate=yes',
    true, true, true, false, 600, 'IDER Cartagena'
),
(
    'Cancha Olaya Herrera (Sector Central / Playa Blanca)', 'Cancha de Olaya',
    'Localidad 2: De la Virgen y Turística', 'Olaya Herrera',
    'Calle 34 # 58-12, Sector Playa Blanca', 'A 2 cuadras de la Av. Pedro Romero',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.4050200, -75.4920100,
    'https://maps.google.com/?q=10.405020,-75.492010', 'https://waze.com/ul?ll=10.405020,-75.492010&navigate=yes',
    true, true, false, false, 450, 'IDER Cartagena'
),
(
    'Cancha Sintética Las Gaviotas', 'Cancha Las Gaviotas',
    'Localidad 2: De la Virgen y Turística', 'Las Gaviotas',
    'Manzana 14 frente al Parque Las Gaviotas', 'Cerca a la Av. Pedro de Heredia',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.4012100, -75.5035200,
    'https://maps.google.com/?q=10.401210,-75.503520', 'https://waze.com/ul?ll=10.401210,-75.503520&navigate=yes',
    true, true, false, true, 300, 'IDER Cartagena'
),
(
    'Cancha de Fútbol La Esperanza', 'Cancha La Esperanza',
    'Localidad 2: De la Virgen y Turística', 'La Esperanza',
    'Calle 36 con Carrera 35, La Esperanza', 'Sector Vía Perimetral',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_9', 10.4140100, -75.5090200,
    'https://maps.google.com/?q=10.414010,-75.509020', 'https://waze.com/ul?ll=10.414010,-75.509020&navigate=yes',
    true, true, false, false, 350, 'IDER Cartagena'
),
(
    'Cancha Sintética Boston', 'Cancha Barrio Boston',
    'Localidad 2: De la Virgen y Turística', 'Boston',
    'Calle 33 con Carrera 44, Boston', 'Frente al puesto de salud de Boston',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.4110100, -75.5060200,
    'https://maps.google.com/?q=10.411010,-75.506020', 'https://waze.com/ul?ll=10.411010,-75.506020&navigate=yes',
    true, true, false, false, 250, 'IDER Cartagena'
),
(
    'Cancha Flor del Campo / Colombiatón', 'Cancha Flor del Campo',
    'Localidad 2: De la Virgen y Turística', 'Flor del Campo',
    'Sector Ciudadela Bicentenario Manzana G', 'Junto al megacolegio Flor del Campo',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.4290100, -75.4510200,
    'https://maps.google.com/?q=10.429010,-75.451020', 'https://waze.com/ul?ll=10.429010,-75.451020&navigate=yes',
    true, true, false, true, 400, 'IDER Cartagena / Fundación Santo Domingo'
),
(
    'Cancha de Fútbol Nelson Mandela (Sector Las Vegas)', 'Cancha Nelson Mandela',
    'Localidad 2: De la Virgen y Turística', 'Nelson Mandela',
    'Sector Las Vegas Calle 12', 'Cerca al Centro Comunitario Nelson Mandela',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3750200, -75.4780100,
    'https://maps.google.com/?q=10.375020,-75.478010', 'https://waze.com/ul?ll=10.375020,-75.478010&navigate=yes',
    true, true, true, false, 500, 'IDER Cartagena'
),
(
    'Cancha Fredonia', 'Cancha Principal de Fredonia',
    'Localidad 2: De la Virgen y Turística', 'Fredonia',
    'Calle 14 con Carrera 70, Fredonia', 'Sector Las Américas',
    'PUBLICO_IDER', 'ARENA', 'FUTBOL_11', 10.4020100, -75.4850200,
    'https://maps.google.com/?q=10.402010,-75.485020', 'https://waze.com/ul?ll=10.402010,-75.485020&navigate=yes',
    true, false, false, false, 300, 'IDER Cartagena'
),
(
    'Cancha Chiquinquirá (Parque de la Virgen)', 'Cancha Chiquinquirá',
    'Localidad 2: De la Virgen y Turística', 'Chiquinquirá',
    'Transversal 54 con Calle 31D, Chiquinquirá', 'Cerca al Mercado de Bazurto',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.4045100, -75.5075200,
    'https://maps.google.com/?q=10.404510,-75.507520', 'https://waze.com/ul?ll=10.404510,-75.507520&navigate=yes',
    true, true, false, false, 250, 'IDER Cartagena'
),

-- ============================================================================
-- LOCALIDAD 3: INDUSTRIAL Y DE LA BAHÍA
-- ============================================================================
(
    'Cancha de Fútbol Blas de Lezo (Plan 500)', 'Cancha Blas de Lezo',
    'Localidad 3: Industrial y de la Bahía', 'Blas de Lezo',
    'Manzana 25 con Carrera 68, Plan 500', 'Detrás del Supertiendas Olímpica',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3875100, -75.5090200,
    'https://maps.google.com/?q=10.387510,-75.509020', 'https://waze.com/ul?ll=10.387510,-75.509020&navigate=yes',
    true, true, true, true, 900, 'IDER Cartagena'
),
(
    'Cancha de Fútbol El Socorro (Plan 400)', 'Cancha El Socorro',
    'Localidad 3: Industrial y de la Bahía', 'El Socorro',
    'Carrera 71 con Calle 25, Plan 400', 'Frente al Centro Comercial La Plazuela',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3840200, -75.5010100,
    'https://maps.google.com/?q=10.384020,-75.501010', 'https://waze.com/ul?ll=10.384020,-75.501010&navigate=yes',
    true, true, true, true, 800, 'IDER Cartagena'
),
(
    'Cancha de Fútbol Los Caracoles', 'Cancha Los Caracoles',
    'Localidad 3: Industrial y de la Bahía', 'Los Caracoles',
    'Manzana 18 con Calle 26, Los Caracoles', 'Contiguo al Polideportivo Los Caracoles',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3910100, -75.5080200,
    'https://maps.google.com/?q=10.391010,-75.508020', 'https://waze.com/ul?ll=10.391010,-75.508020&navigate=yes',
    true, true, false, true, 600, 'IDER Cartagena'
),
(
    'Cancha La Campiña / Santa Mónica', 'Cancha La Campiña',
    'Localidad 3: Industrial y de la Bahía', 'La Campiña',
    'Diagonal 30 con Transversal 52, La Campiña', 'Cerca a la Clínica Madre Bernarda',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3930100, -75.5150200,
    'https://maps.google.com/?q=10.393010,-75.515020', 'https://waze.com/ul?ll=10.393010,-75.515020&navigate=yes',
    true, true, true, true, 700, 'IDER Cartagena'
),
(
    'Cancha de Fútbol El Campestre / Vista Hermosa', 'Cancha El Campestre',
    'Localidad 3: Industrial y de la Bahía', 'El Campestre',
    'Calle 14 con Carrera 58, El Campestre', 'Frente al Colegio Inem José Manuel Rodríguez',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3780100, -75.5120200,
    'https://maps.google.com/?q=10.378010,-75.512020', 'https://waze.com/ul?ll=10.378010,-75.512020&navigate=yes',
    true, true, false, true, 500, 'IDER Cartagena'
),
(
    'Cancha Sintética Nuevo Bosque', 'Cancha Nuevo Bosque',
    'Localidad 3: Industrial y de la Bahía', 'Nuevo Bosque',
    'Transversal 49 con Calle 28, Nuevo Bosque', 'Cerca al Parque de la Virgencita',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.3965100, -75.5180200,
    'https://maps.google.com/?q=10.396510,-75.518020', 'https://waze.com/ul?ll=10.396510,-75.518020&navigate=yes',
    true, true, false, false, 300, 'IDER Cartagena'
),
(
    'Cancha de Fútbol Martínez Martelo', 'Cancha Martínez Martelo',
    'Localidad 3: Industrial y de la Bahía', 'Martínez Martelo',
    'Calle 29 con Carrera 30, Martínez Martelo', 'A 3 cuadras de la Escuela Naval',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_9', 10.4040100, -75.5250200,
    'https://maps.google.com/?q=10.404010,-75.525020', 'https://waze.com/ul?ll=10.404010,-75.525020&navigate=yes',
    true, true, false, true, 400, 'IDER Cartagena'
),
(
    'Cancha Ceballos / Santa Clara', 'Cancha Ceballos',
    'Localidad 3: Industrial y de la Bahía', 'Ceballos',
    'Transversal 54 con Diagonal 24, Ceballos', 'Junto a la sede Sena de Ceballos',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.3890200, -75.5190100,
    'https://maps.google.com/?q=10.389020,-75.519010', 'https://waze.com/ul?ll=10.389020,-75.519010&navigate=yes',
    true, true, false, false, 250, 'IDER Cartagena'
),
(
    'Cancha Sintética Santa Lucía', 'Cancha Santa Lucía',
    'Localidad 3: Industrial y de la Bahía', 'Santa Lucía',
    'Calle 31 con Carrera 71, Santa Lucía', 'Detrás del Centro Comercial Santa Lucía',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_7', 10.3880100, -75.4960200,
    'https://maps.google.com/?q=10.388010,-75.496020', 'https://waze.com/ul?ll=10.388010,-75.496020&navigate=yes',
    true, true, false, true, 200, 'IDER Cartagena'
),
(
    'Cancha Providencia', 'Cancha Barrio Providencia',
    'Localidad 3: Industrial y de la Bahía', 'Providencia',
    'Calle 30 con Carrera 70, Providencia', 'Cerca a la Universidad de Cartagena Sede San Jerónimo',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.3850100, -75.4920200,
    'https://maps.google.com/?q=10.385010,-75.492020', 'https://waze.com/ul?ll=10.385010,-75.492020&navigate=yes',
    true, true, false, false, 200, 'IDER Cartagena'
),
(
    'Cancha Ciudadela 2000', 'Cancha Ciudadela 2000',
    'Localidad 3: Industrial y de la Bahía', 'Ciudadela 2000',
    'Manzana 34 frente al Parque Infantil', 'Vía de acceso desde El Pozón',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_11', 10.3760100, -75.4890200,
    'https://maps.google.com/?q=10.376010,-75.489020', 'https://waze.com/ul?ll=10.376010,-75.489020&navigate=yes',
    true, true, false, false, 350, 'IDER Cartagena'
),
(
    'Cancha Polideportiva Pasacaballos', 'Cancha Pasacaballos',
    'Corregimientos / Zona Industrial', 'Pasacaballos',
    'Calle Real del Río, Pasacaballos', 'Frente al Canal del Dique',
    'PUBLICO_IDER', 'ARENA', 'FUTBOL_11', 10.2980100, -75.5150200,
    'https://maps.google.com/?q=10.298010,-75.515020', 'https://waze.com/ul?ll=10.298010,-75.515020&navigate=yes',
    true, false, false, true, 300, 'Comunidad / IDER'
),
(
    'Cancha Sintética Almirante Colón', 'Cancha Almirante Colón',
    'Localidad 3: Industrial y de la Bahía', 'Almirante Colón',
    'Manzana 5 con Transversal 53, Almirante Colón', 'Frente al Colegio Biffi',
    'PUBLICO_IDER', 'SINTETICA', 'FUTBOL_8', 10.3925100, -75.5130200,
    'https://maps.google.com/?q=10.392510,-75.513020', 'https://waze.com/ul?ll=10.392510,-75.513020&navigate=yes',
    true, true, false, false, 250, 'IDER Cartagena'
),

-- ============================================================================
-- CLUBES PRIVADOS, COMPLEJOS RECREACIONALES & CAJAS DE COMPENSACIÓN
-- ============================================================================
(
    'Canchas de Fútbol Club Campestre de Cartagena', 'Sede Deportiva Club Campestre',
    'Localidad 3: Industrial y de la Bahía', 'Vía a Turbaco Km 3',
    'Carretera Troncal de Occidente # 80-100', 'Entrada Club Campestre',
    'CLUB_CAMPESTRE', 'CESPED_NATURAL', 'FUTBOL_11', 10.3480200, -75.4420100,
    'https://maps.google.com/?q=10.348020,-75.442010', 'https://waze.com/ul?ll=10.348020,-75.442010&navigate=yes',
    true, true, true, true, 800, 'Club Campestre S.A.'
),
(
    'Centro Recreacional Takurika (Comfenalco)', 'Canchas Takurika Bayunca',
    'Corregimientos / Zona Norte', 'Bayunca',
    'Km 14 Vía al Mar, Bayunca', 'Complejo Recreacional Takurika',
    'COMPLEJO_DEPORTIVO', 'CESPED_NATURAL', 'FUTBOL_11', 10.4450100, -75.4380200,
    'https://maps.google.com/?q=10.445010,-75.438020', 'https://waze.com/ul?ll=10.445010,-75.438020&navigate=yes',
    true, true, true, true, 1000, 'Comfenalco Cartagena'
),
(
    'Canchas Deportivas Comfamiliar Zaragocilla', 'Sede Comfamiliar Zaragocilla',
    'Localidad 2: De la Virgen y Turística', 'Zaragocilla',
    'Calle 30 # 50-45, Zaragocilla', 'Contiguo a la sede de Salud Comfamiliar',
    'COMPLEJO_DEPORTIVO', 'SINTETICA', 'FUTBOL_9', 10.4020100, -75.5160200,
    'https://maps.google.com/?q=10.402010,-75.516020', 'https://waze.com/ul?ll=10.402010,-75.516020&navigate=yes',
    true, true, true, true, 500, 'Comfamiliar Cartagena'
),
(
    'Canchas Sintéticas Gol Center Cartagena', 'Gol Center Ternera',
    'Localidad 3: Industrial y de la Bahía', 'Ternera',
    'Diagonal 32 con Carrera 82, Ternera', 'Cerca a la Universidad San Buenaventura',
    'PRIVADO_COMERCIAL', 'SINTETICA', 'FUTBOL_7', 10.3790100, -75.4950200,
    'https://maps.google.com/?q=10.379010,-75.495020', 'https://waze.com/ul?ll=10.379010,-75.495020&navigate=yes',
    true, true, true, true, 300, 'Gol Center S.A.S.'
),
(
    'Complejo Deportivo Maracaná Synthetic Fields', 'Maracaná El Bosque',
    'Localidad 3: Industrial y de la Bahía', 'El Bosque',
    'Av. Crisanto Luque # 45-20, El Bosque', 'Diagonal a Reficar / Zona de talleres',
    'PRIVADO_COMERCIAL', 'SINTETICA', 'FUTBOL_8', 10.4005100, -75.5220200,
    'https://maps.google.com/?q=10.400510,-75.522020', 'https://waze.com/ul?ll=10.400510,-75.522020&navigate=yes',
    true, true, true, true, 350, 'Maracaná Sport Club'
),
(
    'Canchas Sintéticas Champions League Cartagena', 'Champions Bruselas',
    'Localidad 3: Industrial y de la Bahía', 'Amberes / Bruselas',
    'Calle 28 # 32-15, Barrio Bruselas', 'Frente a la estación de policía de Bruselas',
    'PRIVADO_COMERCIAL', 'SINTETICA', 'FUTBOL_6', 10.4060100, -75.5230200,
    'https://maps.google.com/?q=10.406010,-75.523020', 'https://waze.com/ul?ll=10.406010,-75.523020&navigate=yes',
    true, true, false, true, 200, 'Champions League CTG'
),
(
    'Canchas Sintéticas Champions Club San Fernando', 'Champions San Fernando',
    'Localidad 2: De la Virgen y Turística', 'San Fernando',
    'Calle 15 con Carrera 82, San Fernando', 'A 100 metros de la Cancha Monumental',
    'PRIVADO_COMERCIAL', 'SINTETICA', 'FUTBOL_7', 10.3915100, -75.4910200,
    'https://maps.google.com/?q=10.391510,-75.491020', 'https://waze.com/ul?ll=10.391510,-75.491020&navigate=yes',
    true, true, true, true, 250, 'Champions Club S.A.S.'
),
(
    'Estadio Municipal de Bayunca', 'Cancha de Bayunca',
    'Corregimientos / Zona Norte', 'Bayunca',
    'Entrada principal Corregimiento de Bayunca', 'Frente a la plaza central de Bayunca',
    'PUBLICO_IDER', 'ARENA', 'FUTBOL_11', 10.4480100, -75.4320200,
    'https://maps.google.com/?q=10.448010,-75.432020', 'https://waze.com/ul?ll=10.448010,-75.432020&navigate=yes',
    true, true, false, true, 500, 'IDER Cartagena'
)
ON CONFLICT DO NOTHING;
