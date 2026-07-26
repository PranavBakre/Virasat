// Emits 16 kHz signed 16-bit PCM in ~40ms chunks.
//
// `process()` runs every 128 frames (~2.7ms at 48 kHz). Posting each quantum
// separately produced ~375 messages a second, each becoming its own WebSocket
// frame and its own base64 encode on the server. Accumulate instead.
const TARGET_RATE = 16_000;
const CHUNK_SAMPLES = 640; // 40ms at 16 kHz

class Pcm16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    // The page asks for an AudioContext at 16 kHz, so this is normally 1 and the
    // resampling below is an exact pass-through. It stays in place for browsers
    // that decline the requested rate.
    this.ratio = sampleRate / TARGET_RATE;
    this.position = 0;
    this.buffer = new Int16Array(CHUNK_SAMPLES);
    this.filled = 0;
  }

  push(sample) {
    const clamped = Math.max(-1, Math.min(1, sample));
    this.buffer[this.filled] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    this.filled += 1;
    if (this.filled === CHUNK_SAMPLES) this.flush();
  }

  flush() {
    if (!this.filled) return;
    const chunk = this.buffer.slice(0, this.filled);
    this.port.postMessage(chunk.buffer, [chunk.buffer]);
    this.filled = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;

    while (this.position < input.length) {
      const index = Math.floor(this.position);
      const next = Math.min(index + 1, input.length - 1);
      const mix = this.position - index;
      this.push(input[index] + (input[next] - input[index]) * mix);
      this.position += this.ratio;
    }
    // Carry the fractional offset so chunk boundaries do not drift.
    this.position -= input.length;

    return true;
  }
}

registerProcessor("pcm16-processor", Pcm16Processor);
