import {System} from "../system.js";
import {BodyComponent} from "../components/body_component.js";
import { ObjectComponent } from "../components/object_component.js";
import { ThreePhysics } from "../../three_physics.js";
import { InstancedMeshComponent, InstancedMeshObjectComponent } from "../components/instanced_mesh_component.js";

export class PhysicsInstancedSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetInstancedEntities = [];
        this.targetEntities = [];

        this.world = ThreePhysics.getInstance().world;
    }

    update() {
        let _this = this;

        this.targetEntities = this.em.query(this.targetEntities, BodyComponent, InstancedMeshObjectComponent);
        this.targetEntities.forEach((entity) => {
            let obj = _this.em.getComponent(entity, InstancedMeshObjectComponent);
            let index = obj.index;
            let imComp = _this.em.getComponent(obj.parentEntity, InstancedMeshComponent);
            let body = _this.em.getComponent(entity, BodyComponent);
            let rigidbody = body.rigidbody;
            imComp.temp.position.copy(rigidbody.translation());
            imComp.temp.quaternion.copy(rigidbody.rotation());
            imComp.temp.updateMatrix();
            imComp.instancedMesh.setMatrixAt(index, imComp.temp.matrix);
            imComp.instancedMesh.instanceMatrix.needsUpdate = true;
        });
        
    }
}