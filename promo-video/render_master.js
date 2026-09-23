const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROMO_DIR = __dirname;
const ASSETS_DIR = path.join(PROMO_DIR, 'assets');
const AUDIO_DIR = path.join(PROMO_DIR, 'audio');
const BGM_PATH = path.join(AUDIO_DIR, 'bgm_track.wav');
const SEGS_DIR = path.join(PROMO_DIR, 'segments');
const OUTPUT_DIR = path.join(PROMO_DIR, 'output');
const ARTIFACTS_DIR = '/Users/sectic/.gemini/antigravity-cli/brain/99f28f48-6add-4d28-8d5c-bac40c11c044';

if (!fs.existsSync(SEGS_DIR)) fs.mkdirSync(SEGS_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const durations = JSON.parse(fs.readFileSync(path.join(AUDIO_DIR, 'durations.json'), 'utf-8'));

const scenes = [
  { index: 1, id: 'scene1_hook', frame: 'frame_scene1_hook.png' },
  { index: 2, id: 'scene2_ecosystem', frame: 'frame_scene2_ecosystem.png' },
  { index: 3, id: 'scene3_asistencias', frame: 'frame_scene3_asistencias.png' },
  { index: 4, id: 'scene4_partidos_tactica', frame: 'frame_scene4_partidos_tactica.png' },
  { index: 5, id: 'scene5_canchas', frame: 'frame_scene5_canchas.png' },
  { index: 6, id: 'scene6_scouting_ia', frame: 'frame_scene6_scouting_ia.png' },
  { index: 7, id: 'scene7_carnet_tienda', frame: 'frame_scene7_carnet_tienda.png' },
  { index: 8, id: 'scene8_outro', frame: 'frame_scene8_outro.png' },
];

async function main() {
  console.log('🎬 Iniciando renderizado de video promocional de SportCoreOS (1080p 60fps)...');
  const segmentFiles = [];

  for (const sc of scenes) {
    const audioPath = path.join(AUDIO_DIR, `${sc.id}.wav`);
    const framePath = path.join(ASSETS_DIR, sc.frame);
    const audioDur = durations[sc.id] || 10;
    const sceneDur = Number((audioDur + 0.6).toFixed(2));
    const segOutput = path.join(SEGS_DIR, `seg_${sc.index}_${sc.id}.mp4`);

    console.log(`🎥 Renderizando Escena ${sc.index} [${sc.id}] (Duración: ${sceneDur}s)...`);

    const cmd = `ffmpeg -y \
      -loop 1 -t ${sceneDur} -i "${framePath}" \
      -i "${audioPath}" \
      -filter_complex "
        [0:v]scale=1920:1080,fps=60,format=yuv420p[vout];
        [1:a]apad=pad_dur=${sceneDur},atrim=0:${sceneDur},afade=t=in:st=0:d=0.2,afade=t=out:st=${(sceneDur - 0.3).toFixed(2)}:d=0.3[aout]
      " \
      -map "[vout]" -map "[aout]" \
      -c:v libx264 -preset fast -crf 18 \
      -c:a aac -b:a 192k \
      "${segOutput}" 2>/dev/null`;

    execSync(cmd);
    segmentFiles.push(segOutput);
    console.log(`✅ Escena ${sc.index} lista: ${segOutput}`);
  }

  // Generate Concat Demuxer List
  const concatListPath = path.join(SEGS_DIR, 'concat_list.txt');
  const concatContent = segmentFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const concatTempOutput = path.join(SEGS_DIR, 'concat_temp.mp4');
  console.log('🔗 Concatenando escenas...');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${concatTempOutput}" 2>/dev/null`);

  // Total Duration
  const totalDurStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${concatTempOutput}"`).toString().trim();
  const totalDur = parseFloat(totalDurStr);
  console.log(`⏱️ Duración total del video: ${totalDur.toFixed(2)}s`);

  // Final Master Output: Mix Voiceover + Stadium BGM
  const masterOutput = path.join(OUTPUT_DIR, 'sportcore_os_promo_video.mp4');
  console.log('🎚️ Mezclando banda sonora y masterizando video final en MP4...');

  const finalCmd = `ffmpeg -y \
    -i "${concatTempOutput}" \
    -i "${BGM_PATH}" \
    -filter_complex "
      [1:a]atrim=0:${totalDur},volume=0.22,afade=t=in:st=0:d=2.0,afade=t=out:st=${(totalDur - 3.0).toFixed(2)}:d=3.0[bgm];
      [0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]
    " \
    -map 0:v -map "[aout]" \
    -c:v copy \
    -c:a aac -b:a 256k \
    -movflags +faststart \
    "${masterOutput}" 2>/dev/null`;

  execSync(finalCmd);
  console.log(`🎉 Master Video generado exitosamente: ${masterOutput}`);

  // Generate High-Res Poster from Ecosystem Scene (Escena 2)
  const posterOutput = path.join(OUTPUT_DIR, 'sportcore_os_promo_poster.jpg');
  execSync(`ffmpeg -y -ss 00:00:15 -i "${masterOutput}" -vframes 1 -q:v 2 "${posterOutput}" 2>/dev/null`);
  console.log(`🖼️ Poster generado: ${posterOutput}`);

  // Copy to Artifacts folder
  if (fs.existsSync(ARTIFACTS_DIR)) {
    const artVideo = path.join(ARTIFACTS_DIR, 'sportcore_os_promo_video.mp4');
    const artPoster = path.join(ARTIFACTS_DIR, 'sportcore_os_promo_poster.jpg');
    fs.copyFileSync(masterOutput, artVideo);
    fs.copyFileSync(posterOutput, artPoster);
    console.log(`🚀 Video y Poster desplegados en Artifacts: ${artVideo}`);
  }

  const stat = fs.statSync(masterOutput);
  console.log(`📦 Tamaño del archivo final: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(console.error);
