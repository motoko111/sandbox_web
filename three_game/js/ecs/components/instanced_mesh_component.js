import {Component} from '../component.js';
import * as THREE from "three";

export class InstancedMeshComponent extends Component {
    constructor(instancedMesh) {
        super();
        this.instancedMesh = instancedMesh;
        this.temp = new THREE.Object3D();
    }
    setPosition(index, x,y,z){
        if(y == null){
            this.temp.position.set(x,y,z);
        }
        else{
            this.temp.position.copy(x);
        }
        this.temp.updateMatrix();
        this.instancedMesh.setMatrixAt(index, this.temp.matrix);
    }
    setRotition(index, x,y,z,w){
        if(y == null){
            this.temp.quaternion.set(x,y,z,w);
        }
        else{
            this.temp.quaternion.copy(x);
        }
        this.temp.updateMatrix();
        this.instancedMesh.setMatrixAt(index, this.temp.matrix);
    }
}

// instancedMeshの1つの要素を表す
export class InstancedMeshObjectComponent extends Component {
    constructor(parentEntity, index){
        super();
        this.parentEntity = parentEntity; // InstancedMeshComponent entityId
        this.index = index;
    }
}