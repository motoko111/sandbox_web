import {System} from "../system.js";
import {BodyComponent} from "../components/body_component.js";
import { ObjectComponent } from "../components/object_component.js";
import { ThreePhysics } from "../../three_physics.js";
import { InstancedMeshComponent } from "../components/instanced_mesh_component.js";

export class PhysicsSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetEntities = [];

        this.world = ThreePhysics.getInstance().world;
    }

    update() {
        let dt = GetDeltaTime();
        ThreePhysics.getInstance().update(dt);
        let _this = this;

        this.targetEntities = this.em.query(this.targetEntities, BodyComponent, ObjectComponent);
        this.targetEntities.forEach((entity) => {
            let objComp = _this.em.getComponent(entity, ObjectComponent);
            let body = _this.em.getComponent(entity, BodyComponent);
            let obj = objComp.obj;
            let rigidbody = body.rigidbody;
            obj.position.copy(rigidbody.translation());
            obj.quaternion.copy(rigidbody.rotation());
        });
    }
}