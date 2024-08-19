// RAPIER
// https://rapier.rs/docs/user_guides/javascript/colliders/

import {Component} from '../component.js';
import { ThreePhysics } from "../../three_physics.js";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from 'three';

let tempVec3 = {x:0,y:0,z:0};
let tempVec4 = {x:0,y:0,z:0,w:0};
let tempQuat = new THREE.Quaternion();
let tempEuler = new THREE.Euler();

export class BodyComponent extends Component {
    constructor(bodyType = "dynamic", shape = "ball", ...args) {
        super();
        let world = ThreePhysics.getInstance().world;
        if(bodyType == "fixed"){
            this.rigidbody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0));
        }
        else if(bodyType == "dynamic"){
            this.rigidbody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,0,0));
        }
        switch(shape){
            case "ball":{
                let radius = args ? args[0] : 1;
                this.shape = RAPIER.ColliderDesc.ball(radius);
            }break;
            case "box":{
                let w = args ? args[0] : 1;
                let h = args ? args[1] : 1;
                let d = args ? args[2] : 1;
                this.shape = RAPIER.ColliderDesc.cuboid(w,h,d);
            }break;
            case "capsule":{
                this.shape = RAPIER.ColliderDesc.capsule(args[0], args[1]);
            }break;
            case "trimesh":{
                this.shape = RAPIER.ColliderDesc.trimesh(args[0], args[1]);
            }break;
            case "heightfield":{
                this.shape = RAPIER.ColliderDesc.heightfield(args[0],args[1],args[2],args[3]);
            }break;
        }
        this.shape.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        this.collider = world.createCollider(this.shape, this.rigidbody);

    }
    // 位置
    setPosition(x,y,z){
        tempVec3.x = x;
        tempVec3.y = y;
        tempVec3.z = z;
        this.rigidbody.setTranslation(tempVec3);
    }
    // 回転 quaternion
    setRotation(x,y,z,w = 1){
        tempVec4.x = x;
        tempVec4.y = y;
        tempVec4.z = z;
        tempVec4.w = w;
        this.rigidbody.setRotation(tempVec4);
    }
    // 回転 euler
    setEulerAngle(x,y,z){
        tempQuat.setFromEuler(tempEuler.set(THREE.MathUtils.degToRad(x),THREE.MathUtils.degToRad(y),THREE.MathUtils.degToRad(z)));
        this.setRotation(tempQuat.x,tempQuat.y,tempQuat.z,tempQuat.w);
    }
    // 速度
    setVelocity(x,y,z){
        tempVec3.x = x;
        tempVec3.y = y;
        tempVec3.z = z;
        this.rigidbody.setLinvel(tempVec3, true);
    }
    // 加速度
    setAccelerator(x,y,z){
        tempVec3.x = x;
        tempVec3.y = y;
        tempVec3.z = z;
    }
    // 角速度
    setAngleVelocity(x,y,z){
        tempVec3.x = x;
        tempVec3.y = y;
        tempVec3.z = z;
        this.rigidbody.setAngvel(tempVec3, true);
    }
}