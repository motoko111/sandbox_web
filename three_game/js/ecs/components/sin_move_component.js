import {Component} from '../component.js';
import * as THREE from "three";

export class SinMoveComponent extends Component {
    constructor(start,move,timeSpeed){
        super();
        this.start = start;
        this.move = move;
        this.time = 0;
        this.timeSpeed = timeSpeed;
    }
}