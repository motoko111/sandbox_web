import {Component} from '../component.js';
import * as THREE from "three";

export class MoveComponent extends Component {
    constructor(){
        super();
        this.speed = 10;
        this.velocity = new THREE.Vector3(0,0,0);
    }
}