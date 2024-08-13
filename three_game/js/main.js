import {ThreeGameEngine} from "./three_game.js";

let engine = null;

window.addEventListener("load",() => {
    engine = new ThreeGameEngine();
});
window.addEventListener("resize",()=>{
    engine.onResize(window.innerWidth, window.innerHeight);
});