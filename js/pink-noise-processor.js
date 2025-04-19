class PinkNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastOut = 0;
    this.decay = 0.98;
    this.mix = 0.02;
    this.stereoWidth = 0;

    this.port.onmessage = (event) => {
      if (event.data.decay !== undefined) this.decay = event.data.decay;
      if (event.data.mix !== undefined) this.mix = event.data.mix;
      if (event.data.stereoWidth !== undefined) this.stereoWidth = event.data.stereoWidth;
    };
  }

  process(inputs, outputs) {
    const outputL = outputs[0][0];
    const outputR = outputs[0][1];

    for (let i = 0; i < outputL.length; i++) {
      const white = Math.random() * 2 - 1;
      this.lastOut = this.decay * this.lastOut + this.mix * white;
      const offset = (Math.random() * 2 - 1) * this.stereoWidth;

      outputL[i] = this.lastOut - offset;
      outputR[i] = this.lastOut + offset;
    }

    return true;
  }
}

registerProcessor('pink-noise-processor', PinkNoiseProcessor);
