
class SoundPlayer{
    constructor(){
        this.isEnablePlay = true;
        this.octave = 4;
        this.key = 0;
        this.scale = 0;
        this.sharp = 0;
        this.velocity = 100;
        this.synths = [];
        this.synthMap = {};
    }
    async start(){
        await Tone.start();
        this.initSynths();
    }
    async loadAsync(callback) {
        await this.start();
        if(callback) callback();
    }
    calcKey(){
        return this.key + scaleTokey(this.scale) + this.sharp;
    }
    onNoteAttack(note, velocity){
        let info = this.getSynth();
        if(!info.isLoaded) {
            console.log(`Note On: ${note} not loaded.)`);
            return;
        }
        if(info.isActive){
            console.log(`Note On: ${note} aleady used.)`);
            return;
        }
        this.synthMap[note] = info;
        info.isActive = true;
        info.startTime = getCurrentTime();
        const frequency = Tone.Frequency(note, "midi").toFrequency();
        if(this.isEnablePlay) info.synth.triggerAttack(frequency, 0, 0.5 + velocity * 0.01 * 0.5);
        console.log(`Note On: ${note} (velocity: ${velocity})`);
        if(this.onNoteAttackEvent) this.onNoteAttackEvent(note);
    }
    onNoteRelease(note){
        let info = this.synthMap[note];
        if(info == null) {
            console.log(`Note Off: ${note} is null.)`);
            return;
        }
        if(!info.isLoaded || !info.isActive) {
            console.log(`Note Off: ${note} not loaded.)`);
            return;
        }
        this.synthMap[note] = null;
        info.isActive = false;
        info.synth.triggerRelease();
        console.log(`Note Off: ${note}`);
        if(this.onNoteReleaseEvent) this.onNoteReleaseEvent(note, getCurrentTime() - info.startTime);
    }
    createSynth(onload){
        onload();
        return new Tone.Synth().toDestination();
    }
    initSynths(){
        for(let i = this.synths.length-1;i<20;++i){
            let info = {}
            info.isActive = false,
            info.isLoaded = false,
            info.startTime = 0,
            info.synth = this.createSynth(() => {
                info.isLoaded = true;
            }),
            this.synths.push(info);
        }
    }
    getSynth(){
        for(let i = 0; i < this.synths.length; ++i){
            if(!this.synths[i].isActive && this.synths[i].isLoaded){
                return this.synths[i];
            }
        }
        let info = {}
            info.isActive = false,
            info.isLoaded = false,
            info.startTime = 0,
            info.synth = this.createSynth(() => {
                info.isLoaded = true;
            }),
        this.synths.push(info);
        return this.synths[this.synths.length-1];
    }
    setEnablePlay(flag){
        this.isEnablePlay = flag;
    }
}