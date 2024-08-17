import { CoinPusherScene } from "./scenes/coin_pusher_scene.js";
import { MainScene } from "./scenes/main_scene.js";
import {ThreeGameEngine} from "./three_game.js";

let engine = ThreeGameEngine.getInstance();
let lastMouseX = 0;
let lastMouseY = 0;
let lastTouchPositions = {};

window.addEventListener("load",async () => {
    await engine.init();
    await engine.loadScene(CoinPusherScene);
});
window.addEventListener("resize",()=>{
    engine.onResize(window.innerWidth, window.innerHeight);
});
document.addEventListener("keydown", (e) => {
    engine.keypressed(elapsedFrame.code);
});
document.addEventListener("keyup", (e) => {
    engine.keyreleased(e.code);
});
document.addEventListener("mousedown", (e) => {
    e.preventDefault();
    engine.mousepressed(e.clientX,e.clientY,e.button);

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});
document.addEventListener("mouseup", (e) => {
    e.preventDefault();
    engine.mousereleased(e.clientX,e.clientY,e.button);

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});
document.addEventListener("mousemove", (e) => {
    e.preventDefault();
    engine.mousemoved(e.clientX, e.clientY, e.clientX - lastMouseX, e.clientY - lastMouseY);

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});
document.addEventListener("wheel", (e) => {
    e.preventDefault();
    engine.wheelmoved(e.deltaX,e.deltaY);
});
document.addEventListener("pointerdown", (e) => {
    if(e.pointerType === 'touch'){
        e.preventDefault();
        lastTouchPositions[e.pointerId] = { x: e.clientX, y: e.clientY };
        engine.mousepressed(e.clientX,e.clientY,0);
    }
});
document.addEventListener("pointerup", (e) => {
    if(e.pointerType === 'touch'){
        e.preventDefault();
        delete lastTouchPositions[e.pointerId];
        engine.mousereleased(e.clientX,e.clientY,0);
    }
});
document.addEventListener("pointermove", (e) => {
    if(e.pointerType === 'touch'){
        e.preventDefault();
        let lastPosition = lastTouchPositions[e.pointerId];
        if (lastPosition) {
            const deltaX = e.clientX - lastPosition.x;
            const deltaY = e.clientY - lastPosition.y;
            lastPosition.x = e.clientX;
            lastPosition.y = e.clientY;
            lastTouchPositions[e.pointerId] = lastPosition;
            engine.mousemoved(e.clientX, e.clientY, deltaX, deltaY);
        }
    }
});