// Functions
const getEl = (id) => document.querySelector("#" + id);

function toggleAdvanced() {
    const section = getEl("advancedSection");
    section.style.display = section.style.display === "none" ? "block" : "none";
}
// Functions - end

// State
let state = {
    audioChainSetup: null,
    noiseStarted: null,

    audioCtx: null,

    noiseSource: null,
    noiseGainNode: null,
    noiseGainNodeGain: 1,
    lfo: null,
    lfoGain: null,

    overallGainNode: null,
    overallGainNodeGain: 1,

    highpassNode: null,
    lowpassNode: null,
    pannerNode: null,


    stereoWidth: 0.4,
    stereoPan: 0,
    lastOutPink: 0,

    pinkDecay: 0.98,
    pinkMix: 0.02,

    brownStep: 12,
    brownFadeDuration: 0.1,
    brownStep: 0.02,

    lowpassFrequency: 6000,
    highpassFrequency: 100,

    // ambiance: {
    //     enabled: false,
    //     type: "none",
    //     node: null,
    //     gainNode: null,
    //     cache: null,
    // },

    ambianceEnabled: false,
    ambianceType: "none",
    ambientNode: null,
    ambientGainNode: null,
    ambientBufferCache: {},

    // reverb: {
    //     enabled: false,
    //     preset: "none",
    //     node: null,
    //     connected: null,
    //     cache: null,
    // },

    reverbEnabled: false,
    reverbPreset: "none",
    reverbNode: null,
    reverbConnected: null,
    cacheReverbData: null,

    modulation: {
        enabled: false,
        speed: 0,
    },

    timer: 0,
    timerId: null,
    countdownId: null,

    fade: true,

    debounceTimeout: null,
}
const defaultState = { ...state };

// Init
const noisePresets = getPresets();
renderPresetRadios(noisePresets, getEl("presetContainer"));

// Preset
function applyPreset(key) {
    const preset = noisePresets[key];
    if (!preset) return;

    if (key !== "reset") applyPreset('reset');

    console.debug({ preset })

    // Noise type
    if (preset.noiseType) {
        getEl("noiseType").value = preset.noiseType;
        debounceChangeNoiseType();
    }

    if ("noiseGainNodeGain" in preset) {
        state.noiseGainNodeGain = preset.noiseGainNodeGain;
    }

    if (preset.brownStep) {
        state.brownStep = preset.brownStep
    }

    // Filters
    if (preset.lowpassFrequency) {
        getEl("lowpassFrequency").value = preset.lowpassFrequency;

        updateLowpassFrequency();
    }

    if (preset.highpassFrequency) {
        getEl("highpassFrequency").value = preset.highpassFrequency;

        updateHighpassFrequency();
    }

    // Stereo
    if (preset.stereoWidth) {
        getEl("widthSlider").value = preset.stereoWidth;

        updateStereoWidth();
    }

    if (preset.stereoPan) {
        getEl("panSlider").value = preset.stereoPan;

        updateStereoPan();
    }

    // Reverb
    if (
        preset.reverb && 
        ("enabled" in preset.reverb || "preset" in preset.reverb)
    ) {
        getEl("reverbToggle").checked = preset.reverb.enabled;
        getEl("reverbSelect").value = preset.reverb.preset;

        toggleReverb(getEl("reverbToggle"));
    }

    // Modulation
    if (
        preset.modulation && 
        ("enabled" in preset.modulation || "speed" in preset.modulation)
    ) {
        getEl("modToggle").checked = preset.modulation.enabled;
        getEl("modSpeed").value = preset.modulation.speed;

        updateModSpeed();
        toggleModulation();
    }

    // Fade
    if (preset.fade) {
        getEl("fadeToggle").checked = preset.fade;
    }

    // Timer
    if (preset.timer) {
        getEl("timerSelect").value = preset.timer;

        handleTimer();
    }

    // Ambiance (you can define how to load this)
    if (preset.ambiance?.type) {
        state.ambianceType = preset.ambiance?.type;
        getEl("ambientSelect").value = state.ambianceType;
    }

    if (key !== 'reset' && state.noiseStarted) { restartPlayingInstantly(); }
}

// Sound setup
//
function setupAudioChain() {

    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    state.overallGainNode = state.audioCtx.createGain();
    state.highpassNode = state.audioCtx.createBiquadFilter();
    state.highpassNode.type = 'highpass';
    state.highpassNode.frequency.value = parseFloat(getEl('highpassFrequency').value);

    state.lowpassNode = state.audioCtx.createBiquadFilter();
    state.lowpassNode.type = 'lowpass';
    state.lowpassNode.frequency.value = parseFloat(getEl('lowpassFrequency').value);

    state.pannerNode = state.audioCtx.createStereoPanner();
    state.pannerNode.pan.value = parseFloat(getEl('panSlider').value);

    state.reverbNode = state.audioCtx.createConvolver();
    state.ambientGainNode = state.audioCtx.createGain(); // added for ambience volume

    // Chain: Source -> Highpass -> Lowpass -> (Reverb?) -> Panner -> Gain -> Destination
    state.highpassNode.connect(state.lowpassNode);
    state.lowpassNode.connect(state.pannerNode);
    state.pannerNode.connect(state.overallGainNode);
    state.overallGainNode.connect(state.audioCtx.destination);

    state.audioChainSetup = true;
}

function resetPlayerAndState() {
    console.debug("Resetting player and state.");

    if (state.noiseSource) state.noiseSource.disconnect();
    if (state.lfo) state.lfo.stop();
    if (state.lfoGain) state.lfoGain.disconnect();
    if (state.audioCtx) state.audioCtx.close();

    for (key in Object.keys(state)) {
        state[key] = defaultState[key];
    }
}

function handleStartingSound() {
    const useFade = getEl("fadeToggle").checked;
    if (useFade) {
        fadeInSound(3);
    } else {
        state.overallGainNode.gain.value = state.overallGainNodeGain;
    }
}
// setup - end

// Starting
//
function startPlaying() {
    console.log('Start playing');

    setupAudioChain();

    handleTimer();
    handleModulation();
    handleAmbientLayer();
    handleReverbLayer();
    handleColoredNoise();
    handleStartingSound();

    state.noiseStarted = true;
}

function restartPlaying() {
    if (state.audioCtx) stopPlaying();

    startPlaying();
}

function restartPlayingInstantly() {
    if (state.audioCtx) stopPlayingInstantly();

    startPlaying();
}
// Starting - end

// Stopping
//
function stopPreCheck() {
    if (!state.audioCtx) return;
    if (state.timerId) clearTimeout(state.timerId);
    if (state.countdownId) clearInterval(state.countdownId);
}

function stopPlayingInstantly() {
    console.log('Stopping instantly.');

    stopPreCheck();
    resetPlayerAndState();
}

function stopPlaying() {
    const useFade = getEl("fadeToggle").checked;
    console.log(`Stopping. Fade: ${state.useFade}`);

    stopPreCheck();

    if (useFade && state.overallGainNode) {
        fadeOutSound(3);
        setTimeout(() => {
            console.log('Fade enabled. Resetting in 3s')
            resetPlayerAndState();
        }, 3100);
    } else {
        resetPlayerAndState();
    }
}
// Stopping - end

// Noise
//
function changeNoiseType() {
    if (!state.noiseStarted) return;

    restartPlayingInstantly();
}

function debounceChangeNoiseType() {
    clearTimeout(state.debounceTimeout);
    state.debounceTimeout = setTimeout(changeNoiseType, 200);
}

async function handleColoredNoise() {
    const type = getEl("noiseType").value;
    if (state.noiseSource) {
        try { state.noiseSource.disconnect(); } catch (e) { }
        try { state.noiseSource.stop(); } catch (e) { }
        state.noiseSource = null;
    }

    if (type === 'none') return;
    if (!["white", "pink", "brown"].includes(type)) return;

    await state.audioCtx.audioWorklet.addModule(`/js/${type}-noise-processor.js`);
    const workletNode = new AudioWorkletNode(state.audioCtx, `${type}-noise-processor`, {
        outputChannelCount: [2]
    });

    if (type === 'white') {
        workletNode.port.postMessage({
            stereoWidth: state.stereoWidth,
        });

    } else if (type === 'pink') {
        workletNode.port.postMessage({
            decay: state.pinkDecay,
            mix: state.pinkMix,
            stereoWidth: state.stereoWidth,
        });
    } else if (type === 'brown') {
        workletNode.port.postMessage({
            step: state.brownStep,
            stereoWidth: state.stereoWidth,
        });

    }

    state.noiseGainNode = state.audioCtx.createGain();
    state.noiseGainNode.gain.value = state.noiseGainNodeGain;

    state.noiseSource = workletNode;
    workletNode.connect(state.noiseGainNode);
    state.noiseGainNode.connect(state.highpassNode);
    
}
// Noise - end

// Reverb
// 
function isReverbSelectionValid() {
    const enabled = getEl('reverbToggle').checked;
    const preset = getEl('reverbSelect').value;
    const customPreset = getEl('customReverbFile').files[0];
    return enabled && preset !== 'none' && (preset !== 'custom' || customPreset);
}

function handleReverbLayer() {
    const validSelection = isReverbSelectionValid();

    if (state.reverbConnected) {
        disconnectReverb();
    }

    if (validSelection) {
        fetchAndConnectReverb();
    }
}

function disconnectReverb() {
    state.lowpassNode.disconnect();
    if (state.reverbNode) state.reverbNode.disconnect();
    state.lowpassNode.connect(state.pannerNode);
    state.reverbConnected = false;
}

function connectReverb(decodedBuffer) {
    state.reverbNode.buffer = decodedBuffer;
    state.lowpassNode.disconnect();
    state.lowpassNode.connect(state.reverbNode);
    state.reverbNode.connect(state.pannerNode);
    state.reverbConnected = true;
}

function toggleReverb(triggerElement) {
    const checkbox = getEl("reverbToggle");
    const presetSelect = getEl("reverbSelect");
    const customReverbFile = getEl("customReverbFile");

    // const enabled = checkbox.checked;
    const preset = presetSelect.value;

    const validSelection = isReverbSelectionValid();

    // if noise hasn't been started: baal, when it starts it will deal with it
    if (!state.noiseStarted) return;

    // not reverbConnected && not valid: baal, neither it was connected previously, neither there is a valid selection
    if (!state.reverbConnected && !state.validSelection) return;

    // // reverbConnected && valid: may has changed (as this funciton wouldn't be called otherwise), so stop and start again
    // if(reverbConnected && validSelection) {
    //     restartPlayingInstantly();
    // }
    // // revertConnected but not valid: revert needs to be removed
    // if(reverbConnected && !valid) {
    //     restartPlayingInstantly(); // because it is disconnected at initialize
    // }
    // // not reverbConnected && valid: start reverb
    // if(!reverbConnected && validSelection) {
    //     restartPlayingInstantly(); // because it is disconnected and connected again if it is valid
    // }
    // // not reverbConnected && not valid: baal
    // if(!reverbConnected && !validSelection) {
    //     restartPlayingInstantly(); // because it is disconnected and nothing is connected if not valid
    // }

    console.log('need to stop and resetup revert if needed');
    restartPlayingInstantly();

}

function handleReverbPresetSelectionChanged() {
    const presetSelect = getEl("reverbSelect");
    const customReverbFile = getEl("customReverbFile");

    const preset = presetSelect.value;

    if (preset === 'custom') {
        customReverbFile.click();
    } else {
        getEl("selectedCustomReverbFile").textContent = '';
        if (preset !== 'none') {
            fetchAndCacheReverb();
        }
    }

    toggleReverb(presetSelect);

}

function handleCustomReverbFileChanged() {


    const presetSelect = getEl("reverbSelect");
    const customReverbFile = getEl("customReverbFile");
    const file = customReverbFile.files[0];

    if (file && file.type.startsWith("audio/")) {
        getEl("selectedCustomReverbFile").textContent = file.name;
        const reader = new FileReader();
        reader.onload = function () {

            console.log(`custom reverb data retrived from file ${file.name}. caching`);
            state.cacheReverbData = reader.result;
            toggleReverb(customReverbFile);
        }
        reader.readAsArrayBuffer(file);
    } else {
        presetSelect.value = "none";
        toggleReverb(customReverbFile);
    }

}

function fetchAndCacheReverb() {

    const presetSelect = getEl("reverbSelect");
    const preset = presetSelect.value;
    const presetUrl = `./irs/${preset}.mp3`

    fetch(presetUrl)
        .then(res => res.arrayBuffer())
        .then(buf => {
            console.log('preset reverb data retrived. caching');
            state.cacheReverbData = buf;
        });

}

function fetchAndConnectReverb() {
    console.log({ cacheReverbData: state.cacheReverbData })
    if (state.cacheReverbData) {
        console.log('cache available');

        state.audioCtx.decodeAudioData(state.cacheReverbData, (decoded) => {
            connectReverb(decoded);
        }, (err) => {
            console.error("Failed to decode custom reverb file:", err);
        });

    } else {
        console.error('no valid cache');
    }

}
// Reverb - end

// Ambience
//
function updateAmbientSelection() {
    const selected = getEl("ambientSelect").value;
    state.ambianceType = selected; // state only, do not play yet
}

function handleAmbientLayer() {
    if (state.ambientNode) {
        try {
            state.ambientNode.stop();
            state.ambientNode.disconnect();
        } catch (e) { }
        state.ambientNode = null;
    }

    if (state.ambianceType === "none") return;
    console.log({ ambianceType: state.ambianceType })

    const file = `./tracks/${state.ambianceType}.mp3`;

    if (state.ambientBufferCache[state.ambianceType]) {
        playAmbient(state.ambientBufferCache[state.ambianceType]);
    } else {
        fetch(file)
            .then(res => res.arrayBuffer())
            .then(buf => state.audioCtx.decodeAudioData(buf))
            .then(decoded => {
                state.ambientBufferCache[state.ambianceType] = decoded;
                playAmbient(decoded);
            });
    }
}

function playAmbient(buffer) {
    state.ambientNode = state.audioCtx.createBufferSource();
    state.ambientNode.buffer = buffer;
    state.ambientNode.loop = true;

    state.ambientGainNode.gain.value = 0.5;
    state.ambientNode.connect(state.ambientGainNode).connect(state.audioCtx.destination);
    state.ambientNode.start();
}
// Ambience end


// Filters
// 
function updateHighpassFrequency() {
    const slider = getEl('highpassFrequency');
    getEl('highpassValue').textContent = slider.value;
    if (state.highpassNode) {
        state.highpassFrequency = parseFloat(slider.value)
        state.highpassNode.frequency.value = state.highpassFrequency
    };
}

function updateLowpassFrequency() {
    const slider = getEl('lowpassFrequency');
    getEl('freqValue').textContent = slider.value;
    if (state.lowpassNode) {
        state.lowpassFrequency = parseFloat(slider.value);
        state.lowpassNode.frequency.value = state.lowpassFrequency;
    };
}
// Filters - end

// Stereo
// 
function updateStereoWidth() {
    const slider = getEl('widthSlider');
    getEl('widthValue').textContent = slider.value;
    const width = parseFloat(slider.value);
    state.stereoWidth = width;
    if (state.noiseSource?.port) {
        state.noiseSource.port.postMessage({ stereoWidth: width });
    }

}

function updateStereoPan() {
    const slider = getEl('panSlider');
    getEl('panValue').textContent = slider.value;
    if (state.pannerNode) state.pannerNode.pan.value = parseFloat(slider.value);
}
// Stereo - end

// Modulation
// 
function toggleModulation() {
    const enabled = getEl('modToggle').checked;
    state.modulation.enabled = enabled;
    if(state.noiseStarted) handleModulation();
}

function stopModulation() {
    if (state.lfo) state.lfo.stop();
    if (state.lfoGain) state.lfoGain.disconnect();
}

function handleModulation() {
    if(state.modulation.enabled && state.modulation.speed) {
        stopModulation();

        state.lfo = state.audioCtx.createOscillator();
        state.lfoGain = state.audioCtx.createGain();
        state.lfo.frequency.value = state.modulation.speed;
        state.lfoGain.gain.value = 0.1;
        state.lfo.connect(state.lfoGain);
        state.lfoGain.connect(state.overallGainNode.gain);
        state.lfo.start();
    } else {
        stopModulation();
    }
}

function updateModSpeed() {
    const slider = getEl('modSpeed');
    getEl('modSpeedValue').textContent = slider.value;
    state.modulation.speed = parseFloat(slider.value);
    if(state.noiseStarted && state.lfo?.freqency) {
        state.lfo.frequency.value = state.modulation.speed;
    }
}
// Modulation - end

// Timer
// 
function handleTimer() {
    const seconds = parseInt(getEl("timerSelect").value);
    const label = getEl("timerRemaining");

    if (state.timerId) clearTimeout(state.timerId);
    if (state.countdownId) clearInterval(state.countdownId);
    label.textContent = "";

    if (!state.audioCtx || seconds <= 0) return;

    let remaining = seconds;
    label.textContent = formatTime(remaining);

    state.countdownId = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(state.countdownId);
            label.textContent = "";
        } else {
            label.textContent = formatTime(remaining);
        }
    }, 1000);

    state.timerId = setTimeout(() => {
        stopPlaying();
    }, seconds * 1000);
}

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return ` (${m}:${ss})`;
}
// Timer - end

// Fade
// 
function fadeInSound(durationInSeconds) {
    state.overallGainNode.gain.setValueAtTime(0, state.audioCtx.currentTime);
    state.overallGainNode.gain.linearRampToValueAtTime(state.overallGainNodeGain, state.audioCtx.currentTime + durationInSeconds);
}

function fadeOutSound(durationInSeconds) {
    state.overallGainNode.gain.cancelScheduledValues(state.audioCtx.currentTime);
    state.overallGainNode.gain.setValueAtTime(state.overallGainNode.gain.value, state.audioCtx.currentTime);
    state.overallGainNode.gain.linearRampToValueAtTime(0, state.audioCtx.currentTime + durationInSeconds);
}
// Fade - end