
import { ThreeShaderEditor } from "./three_shader_editor.js";

let editor = null;
window.onload = async (e) => {
    editor = new ThreeShaderEditor();
};
window.addEventListener("resize",()=>{
    editor.onResize(window.innerWidth,window.innerHeight);
});