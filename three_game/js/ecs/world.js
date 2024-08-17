import {EntityManager} from "./entity_manager.js";

export class World {
    constructor() {
        this.entityManager = new EntityManager();
        this.systems = [];
        this.isDestroy = false;
    }
    createSystem(cls, ...args){
        let system = new cls(...args);
        this.systems.push(system);
        return system;
    }
    update() {
        for(let i = 0; i < this.systems.length; ++i){
            this.systems[i].update();
        }
    }
    run(){
        let _this = this;
        let tick = () => {
            if(_this.isDestroy) return;
            _this.update();
            requestAnimationFrame(tick);
        };
        tick();
    }
    destroy(){
        this.isDestroy = true;
        this.entityManager.clear();
    }

}