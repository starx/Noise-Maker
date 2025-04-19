class WhiteNoiseProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.stereoWidth = 0;
  
      this.port.onmessage = (event) => {
        if (event.data.stereoWidth !== undefined) {
          this.stereoWidth = event.data.stereoWidth;
        }
      };
    }
  
    process(inputs, outputs) {
      const outputL = outputs[0][0];
      const outputR = outputs[0][1];
  
      for (let i = 0; i < outputL.length; i++) {
        const sample = Math.random() * 2 - 1;
        const offset = (Math.random() * 2 - 1) * this.stereoWidth;
  
        outputL[i] = sample - offset;
        outputR[i] = sample + offset;
      }
  
      return true;
    }
  }
  
  registerProcessor('white-noise-processor', WhiteNoiseProcessor);
  