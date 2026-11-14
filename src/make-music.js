const fs = require("fs");

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BIT_DEPTH = 16;

// Frekuensi nada (C major scale)
const NOTE = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
};

// Bentukan melodi kartun: [frekuensi, durasi detik]
const MELODI = [
  [NOTE.C4, 0.25], [NOTE.E4, 0.25], [NOTE.G4, 0.25], [NOTE.C5, 0.25],
  [NOTE.G4, 0.25], [NOTE.E4, 0.25], [NOTE.C4, 0.5],
  [NOTE.C4, 0.25], [NOTE.E4, 0.25], [NOTE.G4, 0.25], [NOTE.C5, 0.25],
  [NOTE.G4, 0.25], [NOTE.E4, 0.25], [NOTE.C4, 0.5],
  [NOTE.E4, 0.25], [NOTE.G4, 0.25], [NOTE.A4, 0.25], [NOTE.B4, 0.25],
  [NOTE.C5, 0.5], [NOTE.B4, 0.25], [NOTE.A4, 0.25], [NOTE.G4, 0.5],
  [NOTE.C4, 0.25], [NOTE.E4, 0.25], [NOTE.G4, 0.25], [NOTE.C5, 0.25],
  [NOTE.G4, 0.25], [NOTE.E4, 0.25], [NOTE.C4, 1.0],
];

function generateSquareWave(freq, durasi, volume = 0.3) {
  const samples = Math.floor(SAMPLE_RATE * durasi);
  const buf = Buffer.alloc(samples * CHANNELS * 2);
  let offset = 0;
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    const period = 1 / freq;
    const phase = (t % period) / period;
    const val = phase < 0.5 ? volume : -volume;
    const sample = Math.floor(val * 32767);
    buf.writeInt16LE(sample, offset);
    offset += 2;
  }
  return buf;
}

function generateSilence(detika) {
  const samples = Math.floor(SAMPLE_RATE * detika);
  return Buffer.alloc(samples * CHANNELS * 2, 0);
}

function gabungkan(...buffers) {
  return Buffer.concat(buffers);
}

// Bangun musik: ulangi melodi 3x dengan jeda pendek
const bagian = [];
for (let ulang = 0; ulang < 3; ulang++) {
  for (const [freq, detik] of MELODI) {
    bagian.push(generateSquareWave(freq, detik, 0.25));
  }
  bagian.push(generateSilence(0.15));
}
const audio = gabungkan(...bagian);

// Header WAV (RIFF)
const byteRate = SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8);
const blockAlign = CHANNELS * (BIT_DEPTH / 8);
const dataSize = audio.length;
const fileSize = 36 + dataSize;

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeInt32LE(fileSize, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeInt32LE(16, 16); // fmt chunk size
header.writeInt16LE(1, 20);  // PCM
header.writeInt16LE(CHANNELS, 22);
header.writeInt32LE(SAMPLE_RATE, 24);
header.writeInt32LE(byteRate, 28);
header.writeInt16LE(blockAlign, 32);
header.writeInt16LE(BIT_DEPTH, 34);
header.write("data", 36);
header.writeInt32LE(dataSize, 40);

fs.writeFileSync("src/music.wav", Buffer.concat([header, audio]));
const durasi = audio.length / SAMPLE_RATE / CHANNELS / 2;
console.log(`Musik tersimpan: src/music.wav (${Math.round(audio.length / 1024)} KB, ${durasi.toFixed(1)} detik)`);
