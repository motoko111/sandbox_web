
const SOUND_MAP = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
const SOUND_MAP_LOWER = ['a','a+','b','c','c+','d','d+','e','f','f+','g','g+'];
const SOUND_MAP_MINUS_TO_PLUS = {
    'a-':'g+',
    'a':'a',
    'a+':'a+',
    'b-':'a+',
    'b':'b',
    'b+':'c',
    'c-':'b',
    'c':'c',
    'c+':'c+',
    'd-':'c+',
    'd':'d',
    'd+':'d+',
    'e-':'d+',
    'e':'e',
    'e+':'f',
    'f-':'e',
    'f':'f',
    'f+':'f+',
    'g-':'f+',
    'g':'g',
    'g+':'g+',
};
//-3
const KEYBOARD_SIZE_MAP = [];
const SCALE_TO_KEY = [-6,1,-4,3,-2,-7,0,7,2,9,4,11,6]
const SCALE_NOTE = ['Dm','Bbm','Fm','Cm','Gm','Dm','C','G','D','A','E','B','F#']


function mtof(noteNumber) {
    return 440 * Math.pow(2, (noteNumber - 69) / 12);
  }
  
function mtoco(noteNumber, isLower){
    return mtoc(noteNumber,isLower) + "" + mtoo(noteNumber);
}

function toNoteIndex(noteNumber){
    let a4_diff = (noteNumber - 69);
    return (a4_diff + 1200) % 12;
}

function isBlackKeyFromNoteNumber(noteNumber){
    switch(toNoteIndex(noteNumber)){
        case 1:
        case 4:
        case 6:
        case 9:
        case 11:
        {
            return true;
        }
        break;
        default:
        {
            return false;
        }
        break;
    }
}

function mtoc(noteNumber, isLower){
    let a4_diff = (noteNumber - 69);
    let sound_index = (a4_diff + 1200) % 12
    return isLower ? SOUND_MAP_LOWER[sound_index] : SOUND_MAP[sound_index]
}

function mtoo(noteNumber){
    return Math.floor(noteNumber / 12) - 1;
}

function createNoteNumberMap(){
    map = {}
    for(let o = -24;o<=24;++o){
        for(let i = 0;i<12;++i){
            let noteNumber = 0;
            if(i <= 2){
                noteNumber = (i+9) + o * 12;
            }
            else{
                noteNumber = (i-3) + o * 12;
            }
            map[SOUND_MAP[i] + o] = noteNumber;
            map[SOUND_MAP_LOWER[i] + o] = noteNumber
        }
    }
    return map;
}
const NOTENUMBER_MAP = createNoteNumberMap();

function noteStrToNoteNumber(note_str, oct){
    return toNoteNumber(SOUND_MAP_MINUS_TO_PLUS[note_str] + oct);
}

function toNoteNumber(mtoco_str){
    let n = NOTENUMBER_MAP[mtoco_str];
    if(n != undefined) return n;
    return -1000;
}

function getCurrentTime(){
    return Tone.context.currentTime;
}

function scaleTokey(scale){
    return SCALE_TO_KEY[scale+6]
}
function scaleToStartNote(scale){
    return SCALE_NOTE[scale+6];
}