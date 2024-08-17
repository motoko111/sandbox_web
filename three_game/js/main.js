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
document.addEventListener("touchstart", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        lastTouchPositions[touch.identifier] = { x: touch.clientX, y: touch.clientY };
        if(touch.identifier == 0) engine.mousepressed(touch.clientX,touch.clientY,0);
    }
}, true);
document.addEventListener("touchend", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        lastTouchPositions[touch.identifier] = undefined;
        if(touch.identifier == 0) engine.mousereleased(touch.clientX,touch.clientY,0);
    }
}, true);
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        let lastPosition = lastTouchPositions[touch.identifier];

        if (lastPosition) {
            const deltaX = touch.clientX - lastPosition.x;
            const deltaY = touch.clientY - lastPosition.y;
            lastPosition.x = touch.clientX;
            lastPosition.y = touch.clientY;
            lastTouchPositions[touch.identifier] = lastPosition;
            if(touch.identifier == 0) engine.mousemoved(touch.clientX, touch.clientY, deltaX, deltaY);
        }
    }
}, true);