import { SimpleUI, SimpleUIButton } from "./simple_ui.js";
import { ThreeDemo } from "./three_demo.js";

let ui = null;
let demo = null;
window.onload = async (e) => {
    ui = new SimpleUI();
    demo = new ThreeDemo();

    for(let i = 0; i < 100; ++i){
        ui.add(new SimpleUIButton("test" + i, () => {
            console.log("click");
        }));
    }
    

};
