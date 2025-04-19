function getPresets() {
    return {
        "reset": {
            label: "None",
            noiseType: "none",
            brownStep: 0.02,
            noiseGainNodeGain: 0.3,
            lowpassFrequency: 6000,
            highpassFrequency: 100,
            stereoWidth: 0.4,
            stereoPan: 0,
            reverb: { enabled: false, preset: "none" },
            modulation: { enabled: false, speed: 0 },
            fade: true,
            timer: 0,
            ambiance: { enabled: false, type: "none" }
        },
        "static-white": {
            label: "White",
            noiseType: "white",
            lowpassFrequency: 6000,
            highpassFrequency: 100,
            stereoWidth: 0.4,
        },
        "pink": {
            label: "Pink",
            noiseType: "pink",
            lowpassFrequency: 5000,
            highpassFrequency: 80,
            stereoWidth: 0.25,
        },
        "brown": {
            label: "Brown",
            noiseType: "brown",
            brownStep: 0.02,
            lowpassFrequency: 1500,
            highpassFrequency: 70,
            stereoWidth: 0.35,
        },
        "deep-hum": {
            label: "Deep Hum",
            noiseType: "brown",
            brownStep: 0.01,
            lowpassFrequency: 180,
            highpassFrequency: 40,
            stereoWidth: 0.00,
            modulation: { enabled: true, speed: 0.02 },
        },
        "river-stream-slow-24091": {
            label: "River Stream",
            ambiance: { enabled: true, type: "river-stream-slow-24091" }
        },
        // "river-stream-medium-68361": {
        //     noiseType: "white",
        //     freqSlider: 8000,
        //     highpassSlider: 200,
        //     stereoWidth: 0.4,
        //     stereoPan: 0,
        //     modulation: { enabled: true, speed: 0.15 },
        //     ambiance: { enabled: true, type: "river-stream-medium-68361" }
        // },
        "birds-light-26052": {
            label: "Birds Singing",
            ambiance: { enabled: true, type: "birds-light-26052" }
        },
        "birds-semimedium-296528": {
            label: "Birds + Pink",
            noiseType: "pink",
            noiseGainNodeGain: 0.1,
            freqSlider: 7000,
            highpassSlider: 800,
            stereoWidth: 0.3,
            stereoPan: 0.2,
            modulation: { enabled: true, speed: 0.1 },
            ambiance: { enabled: true, type: "birds-semimedium-296528" }
        },
        "field-meadow-51082": {
            label: "Field (Meadows)",
            reverb: { enabled: true, preset: "ir-forest-spring-107133" },
            ambiance: { enabled: true, type: "field-meadow-51082" }
        },
        "fire-crackling-310285": {
            label: "Fire (Soft)",
            stereoWidth: 0.3,
            stereoPan: 0,
            modulation: { enabled: true, speed: 0.12 },
            reverb: { enabled: true, preset: "ir-cave" },            
            ambiance: { enabled: true, type: "fire-crackling-310285" }
        },
        "fireplace-6354": {
            label: "Fireplace",
            reverb: { enabled: true, preset: "ir-cave" },
            modulation: { enabled: true, speed: 0.1 },
            ambiance: { enabled: true, type: "fireplace-6354" }
        },
        "hall-people-17006": {
            label: "Hall",
            reverb: { enabled: true, preset: "ir-hall-44709" },
            ambiance: { enabled: true, type: "hall-people-17006" }
        },
        "library-236734": {
            label: "Library",
            reverb: { enabled: true, preset: "ir-hall-44709" },
            ambiance: { enabled: true, type: "library-236734" }
        },
        "night-bugs-light-7012": {
            label: "Night + Insects",
            modulation: { enabled: true, speed: 0.08 },
            ambiance: { enabled: true, type: "night-bugs-light-7012" }
        },
        // "night-bugs-light-271304": {
        //     label: "Night + Insects 2",
        //     ambiance: { enabled: true, type: "night-bugs-light-271304" }
        // },
        "rain-light-217409": {
            label: "Rain (Light)",
            ambiance: { enabled: true, type: "rain-light-217409" }
        },
        "rain-medium-208505": {
            label: "Rain + White (Sleep)",
            noiseType: "white",
            noiseGainNodeGain: 0.05,
            freqSlider: 9000,
            highpassSlider: 250,
            stereoWidth: 0.4,
            modulation: { enabled: true, speed: 0.01 },
            ambiance: { enabled: true, type: "rain-medium-208505" }
        },
        "rain-medium-319235": {
            label: "Rain (Medium)",
            modulation: { enabled: true, speed: 0.12 },
            ambiance: { enabled: true, type: "rain-medium-319235" }
        },
        "rain-heavy-257596": {
            label: "Rain (Heavy)",
            ambiance: { enabled: true, type: "rain-heavy-257596" }
        },
        "thunder-light-113219": {
            label: "Thunderstorm + Brown",
            noiseType: "brown",
            noiseGainNodeGain: 0.1,
            brownStep: 0.02,
            stereoWidth: 0.35,
            freqSlider: 1200,
            highpassSlider: 80,
            reverb: { enabled: true, preset: "ir-hall-44709" },
            ambiance: { enabled: true, type: "thunder-light-113219" }
        },
        "water-fish-6114": {
            label: "Fish pond",
            ambiance: { enabled: true, type: "water-fish-6114" }
        }
    };
}

function renderPresetRadios(presets, container) {
    container.innerHTML = ""; // clear previous content
  
    Object.entries(presets).forEach(([key, preset]) => {
      const label = document.createElement("label");
      label.className = "item-radio item-radio-icon-start item-content";
  
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "preset-radio";
      input.value = key;
      input.onchange = () => applyPreset(key);
  
      const icon = document.createElement("i");
      icon.className = "icon icon-radio";
  
      const inner = document.createElement("div");
      inner.className = "item-inner";
  
      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = preset?.label || key;
  
      inner.appendChild(title);
      label.appendChild(input);
      label.appendChild(icon);
      label.appendChild(inner);
  
      container.appendChild(label);
    });
}