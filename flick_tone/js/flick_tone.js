const REGEX_NOTE = new RegExp(/^[a-g](\+|\-)?$/g);
const REGEX_NOTE_START_WITH = new RegExp(/^[a-g](\+|\-)?/g);
const REGEX_NOTE_OCT_PLUS = new RegExp(/^[a-g](\+|\-)?[1]$/g);
const REGEX_OCT_PLUS = new RegExp(/^oct\+/g);
const REGEX_OCT_MINUS = new RegExp(/^oct\-/g);
const REGEX_KEY_PLUS = new RegExp(/^key\+/g);
const REGEX_KEY_MINUS = new RegExp(/^key\-/g);

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
    keyboard.textCustomFunc = (param, x,y,type) => {
        if(!param) return;
        if(param.value.match(REGEX_NOTE) || param.value.match(REGEX_NOTE_OCT_PLUS))
        {
            let val = param.value;
            if(param.value.match(REGEX_NOTE_OCT_PLUS)){
                val = param.value.match(REGEX_NOTE_START_WITH)[0];
            }
            let noteNumber = noteStrToNoteNumber(val,player.octave) + player.key;
            return mtoco(noteNumber);
        }
        return param.text;
    };
    keyboard.defaultKeyEvent = (val,type) => {
        if(val === "del"){
        }
        else{
            if(val.match(REGEX_NOTE_OCT_PLUS)){
                val = val.match(REGEX_NOTE_START_WITH)[0];
                if(type == "down"){
                    player.loadAsync(() => player.onNoteAttack(noteStrToNoteNumber(val,player.octave + 1) + player.key, player.velocity));
                }
                else{
                    player.loadAsync(() => player.onNoteRelease(noteStrToNoteNumber(val,player.octave + 1)+ player.key));
                }
            }
            else if(val.match(REGEX_NOTE))
            {
                if(type == "down"){
                    player.loadAsync(() => player.onNoteAttack(noteStrToNoteNumber(val,player.octave)+ player.key, player.velocity));
                }
                else{
                    player.loadAsync(() => player.onNoteRelease(noteStrToNoteNumber(val,player.octave)+ player.key));
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
        }
    };
    await loadJsonAsync("../../flick_keyboard/assets/flick_keyboard_mml.json");

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
}

window.onload = (ev) => {
    asyncInit();
}