import {System} from "../system.js";

// 外部から処理対象と処理を定義するシステム
export class SimpleSystem extends System {
    constructor(em, clsList, func) {
        super();
        this.em = em;
        this.targetEntities = [];

        this.clsList = clsList;
        this.func = func; // em,entity
    }

    update() {
        this.targetEntities = this.em.query(this.targetEntities, this.clsList);
        this.targetEntities.forEach(this.execFunc);
    }
    execFunc(entity){
        this.func(this.em,entity);
    }
}