const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, 'audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const VOICE = 'Paulina'; // Spanish (Mexico) high-clarity voice

const script = [
  {
    id: 'scene1_hook',
    title: 'Hook & Problema',
    text: '¿Administrar tu club o academia deportiva sigue dependiendo de planillas de papel, mensajes caóticos y cobros desorganizados? Es momento de evolucionar al estándar profesional.'
  },
  {
    id: 'scene2_ecosystem',
    title: 'Ecosistema Integral SportCoreOS',
    text: 'Te presentamos SportCoreOS: la plataforma en la nube diseñada para directores técnicos, deportistas y directivos en una experiencia ágil, moderna y en tiempo real.'
  },
  {
    id: 'scene3_asistencias',
    title: 'Entrenamientos & Asistencia QR',
    text: 'Controla entrenamientos con pase de lista táctil y código Q R en cancha. Registra puntualidad, novedades médicas y cargas de trabajo con un solo toque desde cualquier dispositivo.'
  },
  {
    id: 'scene4_partidos_tactica',
    title: 'Partidos & Pizarra Táctica',
    text: 'Organiza partidos y torneos sin fricción. Diseña alineaciones en la pizarra táctica interactiva, cita a tus jugadores con notificación inmediata y registra actas arbitrales en vivo.'
  },
  {
    id: 'scene5_canchas',
    title: 'Alquiler de Canchas & Escenarios',
    text: 'Maximiza el uso de tus instalaciones deportivas. Gestiona la disponibilidad horaria de canchas, iluminación nocturna y tarifas con reservas y pagos en línea integrados.'
  },
  {
    id: 'scene6_scouting_ia',
    title: 'Scouting & Boletín con IA',
    text: 'Potencia el talento de tus atletas con inteligencia artificial. Evaluaciones técnicas personalizadas, radar de habilidades por posición y boletines descargables en formato PDF.'
  },
  {
    id: 'scene7_carnet_tienda',
    title: 'Carnet Digital & Tienda Oficial',
    text: 'Identificación oficial con carnet digital y validación Q R biométrica, junto a una tienda virtual para adquirir uniformes oficiales con control de inventario.'
  },
  {
    id: 'scene8_outro',
    title: 'Cierre & Llamado a la Acción',
    text: 'SportCoreOS: Potenciando el deporte con tecnología de élite. Solicita tu demostración hoy mismo y lleva tu club al siguiente nivel.'
  }
];

console.log('🎙️ Generando pistas de locución en español para SportCoreOS...');

const durations = {};

for (const sc of script) {
  const aiffPath = path.join(AUDIO_DIR, `${sc.id}.aiff`);
  const wavPath = path.join(AUDIO_DIR, `${sc.id}.wav`);

  console.log(`🗣️ Generando audio para [${sc.id}] - ${sc.title}...`);
  try {
    execSync(`say -v "${VOICE}" -r 175 -o "${aiffPath}" "${sc.text}"`);
  } catch (err) {
    console.warn(`Fallback default voice for ${sc.id}...`);
    execSync(`say -r 175 -o "${aiffPath}" "${sc.text}"`);
  }

  // Convert to 44.1kHz stereo WAV
  execSync(`ffmpeg -y -i "${aiffPath}" -ar 44100 -ac 2 "${wavPath}" 2>/dev/null`);
  if (fs.existsSync(aiffPath)) fs.unlinkSync(aiffPath);

  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`).toString().trim();
  const dur = parseFloat(durStr);
  durations[sc.id] = dur;
  console.log(`⏱️ ${sc.id}: ${dur.toFixed(2)}s`);
}

fs.writeFileSync(path.join(AUDIO_DIR, 'durations.json'), JSON.stringify(durations, null, 2));
console.log('✅ Todas las locuciones generadas exitosamente con duraciones registradas.');
