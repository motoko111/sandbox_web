import {ThreeGameEngine} from "./three_game.js";

window.addEventListener("load",async () => {
    await ThreeGameEngine.getInstance().init();
});
window.addEventListener("resize",()=>{
    ThreeGameEngine.getInstance().onResize(window.innerWidth, window.innerHeight);
});