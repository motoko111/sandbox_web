import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from "three";

class GameObject{
    constructor(){
        this.collider = null;
        this.rigidbody = null;
    }
}

export { GameObject }