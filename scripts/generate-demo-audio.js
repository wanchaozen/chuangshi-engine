import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 44100;
const durationSeconds = 24;
const sampleCount = sampleRate * durationSeconds;
const channels = 2;
const bytesPerSample = 2;
const dataSize = sampleCount * channels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);

function writeWavHeader() {
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
}

const pentatonic = [220, 261.63, 293.66, 329.63, 392, 440];
const phrase = [0, 2, 4, 3, 1, 2, 5, 4, 2, 1, 0, 2];

function bell(time, start, frequency) {
  const age = time - start;
  if (age < 0 || age > 4.2) return 0;
  const envelope = Math.exp(-age * 1.1) * Math.min(1, age * 18);
  return envelope * (
    Math.sin(2 * Math.PI * frequency * age) * 0.65 +
    Math.sin(2 * Math.PI * frequency * 2.01 * age) * 0.2 +
    Math.sin(2 * Math.PI * frequency * 3.98 * age) * 0.08
  );
}

function deterministicNoise(index) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

writeWavHeader();

for (let index = 0; index < sampleCount; index++) {
  const time = index / sampleRate;
  let melody = 0;
  phrase.forEach((note, step) => {
    melody += bell(time, step * 2, pentatonic[note]);
  });

  const drone = Math.sin(2 * Math.PI * 110 * time) * 0.10
    + Math.sin(2 * Math.PI * 165 * time + 0.35) * 0.04;
  const air = deterministicNoise(index) * 0.012
    * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.07 * time));
  const fade = Math.min(1, time / 2, (durationSeconds - time) / 3);
  const signal = Math.max(-1, Math.min(1, (melody * 0.24 + drone + air) * fade));
  const pan = 0.18 * Math.sin(2 * Math.PI * 0.035 * time);
  const left = Math.round(signal * (1 - pan) * 32767);
  const right = Math.round(signal * (1 + pan) * 32767);
  const offset = 44 + index * 4;
  buffer.writeInt16LE(left, offset);
  buffer.writeInt16LE(right, offset + 2);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../assets/audio/ink-mountain-demo.wav");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, buffer);
console.log(`Generated ${output}`);
