const REGEX_NOTE = new RegExp(/^[a-g](\+|\-)?$/g);
const REGEX_NOTE_START_WITH = new RegExp(/^[a-g](\+|\-)?/g);
const REGEX_NOTE_OCT_PLUS = new RegExp(/^[a-g](\+|\-)?(\-)?[0-9]+$/g);
const REGEX_NOTE_NUM = new RegExp(/(\-)?[0-9]+$/g);
const REGEX_SHARP = new RegExp(/^#$/g);
const REGEX_OCT_PLUS = new RegExp(/^oct\+/g);
const REGEX_OCT_MINUS = new RegExp(/^oct\-/g);
const REGEX_OCT_RESET = new RegExp(/^octreset/g);
const REGEX_KEY_PLUS = new RegExp(/^key\+/g);
const REGEX_KEY_MINUS = new RegExp(/^key\-/g);
const REGEX_KEY_RESET = new RegExp(/^keyreset/g);
const REGEX_SCALE= new RegExp(/^scale$/g);
const REGEX_SCALE_PLUS = new RegExp(/^scale\+/g);
const REGEX_SCALE_MINUS = new RegExp(/^scale\-/g);
const REGEX_SCALE_RESET = new RegExp(/^scalereset/g);

let keyboard = null;
let player = null;

let sliders = {};

let loadJsonAsync = async (path) => {
    const response = await fetch(path);
    let txt = await response.text();
    keyboard.loadJson(txt);
};

let asyncInit = async () => {
    player = new SoundPlayer();

    keyboard = new MultiKeyboard("keyboard");
    keyboard.enableLog = true;
    keyboard.textCustomFunc = (param, x,y,type) => {
        if(!param) return;
        if(param.value.match(REGEX_NOTE) || param.value.match(REGEX_NOTE_OCT_PLUS))
        {
            let val = param.value;
            let addOct = 0;
            if(param.value.match(REGEX_NOTE_OCT_PLUS)){
                val = param.value.match(REGEX_NOTE_START_WITH)[0];
                addOct = Number(param.value.match(REGEX_NOTE_NUM)[0]);
            }
            let noteNumber = noteStrToNoteNumber(val,player.octave + addOct) + player.calcKey();
            return mtoco(noteNumber);
        }
        else if(param.value.match(REGEX_SCALE)){
            return param.text + " " + scaleToStartNote(player.scale);
        }
        return param.text;
    };
    keyboard.defaultKeyEvent = (val,type,item,x,y) => {
        let id = item.id;
        if(val === "del"){
        }
        else{
            if(val.match(REGEX_NOTE_OCT_PLUS)){
                let addOct = 0;
                addOct = Number(val.match(REGEX_NOTE_NUM)[0]);
                val = val.match(REGEX_NOTE_START_WITH)[0];
                if(type == "down"){
                    player.loadAsync(() => player.onNoteAttack(noteStrToNoteNumber(val,player.octave + 1 + addOct) + player.calcKey(), player.velocity, id));
                }
                else{
                    player.loadAsync(() => player.onNoteRelease(noteStrToNoteNumber(val,player.octave + 1 + addOct)+ player.calcKey(), id));
                }
            }
            else if(val.match(REGEX_NOTE))
            {
                if(type == "down"){
                    player.loadAsync(() => player.onNoteAttack(noteStrToNoteNumber(val,player.octave + 1)+ player.calcKey(), player.velocity, id));
                }
                else{
                    player.loadAsync(() => player.onNoteRelease(noteStrToNoteNumber(val,player.octave + 1)+ player.calcKey(), id));
                }
            }
            else if(val.match(REGEX_SHARP)){
                if(type == "down"){
                    player.sharp = 1;
                }
                else{
                    player.sharp = 0;
                }
            }
            else if(val.match(REGEX_OCT_PLUS)){
                player.octave = Math.min(player.octave + 1, 12);
                keyboard.updateText();
                sliders["octave"].slider.value = player.octave;
                sliders["octave"].value.textContent = player.octave;
            }
            else if(val.match(REGEX_OCT_MINUS)){
                player.octave = Math.max(player.octave - 1, 0);
                keyboard.updateText();
                sliders["octave"].slider.value = player.octave;
                sliders["octave"].value.textContent = player.octave;
            }
            else if(val.match(REGEX_OCT_RESET)){
                player.octave = 4;
                keyboard.updateText();
                sliders["octave"].slider.value = player.octave;
                sliders["octave"].value.textContent = player.octave;
            }
            else if(val.match(REGEX_KEY_PLUS)){
                player.key = Math.min(player.key + 1, 12);
                keyboard.updateText();
                sliders["key"].slider.value = player.key;
                sliders["key"].value.textContent = player.key;
            }
            else if(val.match(REGEX_KEY_MINUS)){
                player.key = Math.max(player.key - 1, -12);
                keyboard.updateText();
                sliders["key"].slider.value = player.key;
                sliders["key"].value.textContent = player.key;
            }
            else if(val.match(REGEX_KEY_RESET)){
                player.key = 0;
                keyboard.updateText();
                sliders["key"].slider.value = player.key;
                sliders["key"].value.textContent = player.key;
            }
            else if(val.match(REGEX_SCALE_PLUS)){
                player.scale = Math.min(player.scale + 1, 6);
                keyboard.updateText();
                sliders["scale"].slider.value = player.scale;
                sliders["scale"].value.textContent = player.scale;
            }
            else if(val.match(REGEX_SCALE_MINUS)){
                player.scale = Math.max(player.scale - 1, -6);
                keyboard.updateText();
                sliders["scale"].slider.value = player.scale;
                sliders["scale"].value.textContent = player.scale;
            }
            else if(val.match(REGEX_SCALE_RESET)){
                player.scale = 0;
                keyboard.updateText();
                sliders["scale"].slider.value = player.scale;
                sliders["scale"].value.textContent = player.scale;
            }
        }
    };
    await loadJsonAsync("./../flick_keyboard/assets/flick_keyboard_mml.json");

    let setupSlider = (v,func) => {
        let slider = document.getElementById(v + "_slider");
        let label = document.getElementById(v + "_label");
        let value = document.getElementById(v + "_value");
        label.textContent = v;
        slider.oninput = function(){
            value.textContent = this.value;
            func(this.value);
            keyboard.updateText();
        };
        sliders[v] = {slider:slider,label:label,"value":value};
    };
    setupSlider("octave",(val)=>{player.octave=Number(val);});
    setupSlider("key",(val)=>{player.key=Number(val);});
    setupSlider("scale",(val)=>{player.scale=Number(val);});
}

window.onload = (ev) => {
    asyncInit();
}