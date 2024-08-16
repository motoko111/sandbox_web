import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from "three";

class ThreePhysics{
    constructor(){
    }
    static createInstance(){
        ThreePhysics.instance = new ThreePhysics();
        return ThreePhysics.instance;
    }
    static getInstance(){
        if(ThreePhysics.instance){
            return ThreePhysics.instance;
        }
        return ThreePhysics.createInstance();
    }
    async init(){
        await RAPIER.init();
        this.gravity = new RAPIER.Vector3(0.0,-9.81,0.0);
        //this.gravity = new RAPIER.Vector3(0.0,0.0,0.0);
        this.world = new RAPIER.World(this.gravity);
    }
    update(dt){
        this.world.timestep = Math.min(dt,0.1);
        this.world.step();
    }
}

export { ThreePhysics }