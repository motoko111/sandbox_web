import {System} from "../system.js";
import {BodyComponent} from "../components/body_component.js";
import { ObjectComponent } from "../components/object_component.js";
import { ThreePhysics } from "../../three_physics.js";
import { EnemyTag, PlayerTag } from "../components/tags.js";
import { Input,EInputKey } from '../../input.js';
import { MoveComponent } from "../components/move_component.js";
import { ThreeRender } from "../../three_render.js";
import * as THREE from "three";

export class ControlSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetEntities = [];
    }

    update() {
        let _this = this;
        let dt = GetDeltaTime();

        let axis = Input.getLastAxisCrossInput();
        let forward = ThreeRender.getInstance().getCameraForward();
        let right = ThreeRender.getInstance().getCameraRight();
        forward.y = 0;
        forward.normalize();
        right.y = 0;
        right.normalize();

        this.targetEntities = this.em.query(this.targetEntities, PlayerTag, MoveComponent);
        this.targetEntities.forEach((entity) => {
            let move = _this.em.getComponent(entity, MoveComponent);
            let speed = move.speed;
            move.velocity.x = axis.x * right.x * speed * dt - axis.y * forward.x * speed *  dt;
            move.velocity.y = axis.x * right.y * speed * dt - axis.y * forward.y * speed *  dt;
            move.velocity.z = axis.x * right.z * speed * dt - axis.y * forward.z * speed *  dt;
        });
    }
}