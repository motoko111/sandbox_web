import { Component } from "../component.js";

export class RenderResizeEvent extends Component {
    constructor(w,h){
        super();
        this.w = w;
        this.h = h;
    }
}
