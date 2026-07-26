class Pcm16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16_000;
    this.position = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;

    const samples = [];
    while (this.position < input.length) {
      const index = Math.floor(this.position);
      const next = Math.min(index + 1, input.length - 1);
      const mix = this.position - index;
      const sample = input[index] + (input[next] - input[index]) * mix;
      samples.push(Math.max(-1, Math.min(1, sample)));
      this.position += this.ratio;
    }
    this.position -= input.length;

    const pcm = new Int16Array(samples.length);
    for (let index = 0; index < samples.length; index += 1) {
      pcm[index] = samples[index] < 0
        ? samples[index] * 0x8000
        : samples[index] * 0x7fff;
    }
    this.port.postMessage(pcm.buffer, [pcm.buffer]);
    return true;
  }
}

registerProcessor("pcm16-processor", Pcm16Processor);
