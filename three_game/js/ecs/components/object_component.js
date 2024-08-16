import {Component} from '../component.js';
import * as THREE from "three";

export class ObjectComponent extends Component {
    constructor(obj) {
        super();
        this.obj = obj;
    }
}

export class AddObjectTag extends Component {}
export class DeleteObjectTag extends Component {}