class BrownNoiseProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.lastOut = 0;
      this.step = 0.02;
      this.stereoWidth = 0;
  
      this.port.onmessage = (event) => {
        if (event.data.stereoWidth !== undefined) this.stereoWidth = event.data.stereoWidth;
        if (event.data.step !== undefined) this.step = event.data.step;
        
      };
    }
  
    process(inputs, outputs) {
      const outputL = outputs[0][0];
      const outputR = outputs[0][1];
  
      for (let i = 0; i < outputL.length; i++) {
        const white = Math.random() * 2 - 1;
        this.lastOut += this.step * white;
        this.lastOut = Math.max(-1, Math.min(1, this.lastOut));

        const offset = (Math.random() * 2 - 1) * this.stereoWidth;
  
        outputL[i] = this.lastOut - offset;
        outputR[i] = this.lastOut + offset;
        
      }
  
      return true;
    }
  }
  
registerProcessor('brown-noise-processor', BrownNoiseProcessor);