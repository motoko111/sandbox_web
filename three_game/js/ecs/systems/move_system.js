import {System} from "../system.js";
import {BodyComponent} from "../components/body_component.js";
import { ObjectComponent } from "../components/object_component.js";
import { ThreePhysics } from "../../three_physics.js";
import { PlayerTag } from "../components/tags.js";
import { Input,EInputKey } from '../../input.js';
import { MoveComponent } from "../components/move_component.js";
import { SinMoveComponent } from "../components/sin_move_component.js";

export class MoveSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetEntities = [];
    }

    update() {
        let _this = this;
        let dt = GetDeltaTime();

        this.targetEntities = this.em.query(this.targetEntities, BodyComponent, MoveComponent);
        this.targetEntities.forEach((entity) => {
            let body = _this.em.getComponent(entity, BodyComponent);
            let move = _this.em.getComponent(entity, MoveComponent);
            let pos = body.rigidbody.translation();
            pos.x += move.velocity.x;
            pos.y += move.velocity.y;
            pos.z += move.velocity.z;
            body.rigidbody.setTranslation(pos);
        });

        this.targetEntities = this.em.query(this.targetEntities, BodyComponent, SinMoveComponent);
        this.targetEntities.forEach((entity) => {
            let body = _this.em.getComponent(entity, BodyComponent);
            let move = _this.em.getComponent(entity, SinMoveComponent);
            let pos = body.rigidbody.translation();
            let val = Math.sin(move.time);
            body.rigidbody.setLinvel({x:0,y:0,z:0}, true);
            pos.x = move.start.x + val * move.move.x;
            pos.y = move.start.y + val * move.move.y;
            pos.z = move.start.z + val * move.move.z;
            body.rigidbody.setTranslation(pos);
            move.time += dt * move.timeSpeed;
        });
    }
}