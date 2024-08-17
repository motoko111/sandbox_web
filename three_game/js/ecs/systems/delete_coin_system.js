import {System} from "../system.js";
import {BodyComponent} from "../components/body_component.js";
import { ActiveTag, CoinTag } from "../components/tags.js";

export class DeleteCoinSystem extends System {
    constructor(em, onDelete) {
        super();
        this.em = em;
        this.targetEntities = [];
        this.onDelete = onDelete;
    }

    update() {
        let _this = this;
        let dt = GetDeltaTime();

        this.targetEntities = this.em.query(this.targetEntities, BodyComponent, CoinTag, ActiveTag);
        this.targetEntities.forEach((entity) => {
            let body = _this.em.getComponent(entity, BodyComponent);
            let pos = body.rigidbody.translation();
            if(pos.y < -1){
                _this.onDelete(entity);
            }
        });
    }
}