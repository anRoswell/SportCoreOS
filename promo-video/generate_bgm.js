const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, 'audio');
const BGM_PATH = path.join(AUDIO_DIR, 'bgm_track.wav');

function generateStadiumSportsBgm(outputPath, durationSeconds = 100, sampleRate = 44100) {
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // High-energy Sports Electronic Progression: Am -> F -> C -> G (124 BPM)
  const bpm = 124;
  const beatDur = 60 / bpm;
  const chords = [
    [220.00, 261.63, 329.63, 440.00], // Am
    [174.61, 220.00, 261.63, 349.23], // F
    [130.81, 164.81, 196.00, 261.63], // C
    [196.00, 246.94, 293.66, 392.00], // G
  ];

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / (beatDur * 4)) % chords.length;
    const chord = chords[chordIndex];

    // Master Envelope
    let masterEnv = 1.0;
    if (t < 2.5) masterEnv = t / 2.5;
    else if (t > durationSeconds - 4.0) masterEnv = Math.max(0, (durationSeconds - t) / 4.0);

    // Warm Stadium Synth Pad
    let padSample = 0;
    for (const freq of chord) {
      padSample += Math.sin(2 * Math.PI * freq * t) * 0.18;
      padSample += Math.sin(2 * Math.PI * (freq * 1.004) * t) * 0.10;
    }

    // Driving Sub Bass (Sidechained to the 4/4 kick)
    const beatPos = mod(t, beatDur);
    const sidechainDuck = Math.min(1.0, beatPos / (beatDur * 0.45));
    const bassFreq = chord[0] / 2;
    const bassSample = Math.sin(2 * Math.PI * bassFreq * t) * 0.35 * sidechainDuck;

    // Deep Kick Drum (on every beat)
    const kickEnv = Math.exp(-beatPos * 22);
    const kickFreq = 120 * Math.exp(-beatPos * 30) + 42;
    const kick = Math.sin(2 * Math.PI * kickFreq * beatPos) * kickEnv * 0.45;

    // Snare / Clap on beats 2 & 4
    const barPos = mod(t, beatDur * 2);
    let snare = 0;
    if (barPos >= beatDur) {
      const snarePos = barPos - beatDur;
      const snareEnv = Math.exp(-snarePos * 26);
      snare = (Math.random() * 2 - 1) * snareEnv * 0.22;
    }

    // Hi-Hat on 16th notes
    const sixteenth = mod(t, beatDur / 4);
    const hatEnv = Math.exp(-sixteenth * 45);
    const hat = (Math.random() * 2 - 1) * hatEnv * 0.08;

    // Uplifting Arp Melody
    const arpSubStep = Math.floor(mod(t, beatDur) / (beatDur / 4)) % chord.length;
    const arpFreq = chord[arpSubStep] * 2;
    const arpEnv = Math.exp(-mod(t, beatDur / 4) * 12);
    const arpSample = Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.18;

    // Stereo Mix
    const mixL = (padSample * 0.5 + bassSample + kick + snare * 0.9 + hat * 0.6 + arpSample * 0.8) * masterEnv * 0.30;
    const mixR = (padSample * 0.5 + bassSample + kick + snare * 0.9 + hat * 0.4 + arpSample * 0.6) * masterEnv * 0.30;

    const sampleInt16L = Math.max(-32768, Math.min(32767, Math.floor(mixL * 32767)));
    const sampleInt16R = Math.max(-32768, Math.min(32767, Math.floor(mixR * 32767)));

    buffer.writeInt16LE(sampleInt16L, offset);
    buffer.writeInt16LE(sampleInt16R, offset + 2);
    offset += 4;
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`🎵 Banda sonora sintetizada (${durationSeconds}s): ${outputPath}`);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

generateStadiumSportsBgm(BGM_PATH, 100);
