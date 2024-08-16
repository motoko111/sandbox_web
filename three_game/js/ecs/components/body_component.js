// RAPIER
// https://rapier.rs/docs/user_guides/javascript/colliders/

import {Component} from '../component.js';
import { ThreePhysics } from "../../three_physics.js";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

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
                this.shape = RAPIER.ColliderDesc.trimesh(params.verticies, params.indices);
            }break;
            case "heightfield":{
                this.shape = RAPIER.ColliderDesc.heightfield(args[0],args[1],args[2],args[3]);
            }break;
        }
        this.collider = world.createCollider(this.shape, this.rigidbody);
    }
    setPosition(x,y,z){
        this.rigidbody.setTranslation({x:x,y:y,z:z});
    }
}