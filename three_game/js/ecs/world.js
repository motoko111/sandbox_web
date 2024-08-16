import {EntityManager} from "./entity_manager.js";

export class World {
    constructor() {
        this.entityManager = new EntityManager();
        this.systems = [];
    }
    createSystem(cls, ...args){
        let system = new cls(...args);
        this.systems.push(system);
    }
    update() {
        for(let i = 0; i < this.systems.length; ++i){
            this.systems[i].update();
        }
    }
    run(){
        let _this = this;
        let tick = () => {
            _this.update();
            requestAnimationFrame(tick);
        };
        tick();
    }

}