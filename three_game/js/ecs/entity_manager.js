import {Entity} from "./enitty.js";

export class EntityManager{
    constructor(){
        this.nextId = 0;
        this.entities = [];
        this.componentMap = new Map();
        this.componentCountMap = new Map();
    }
    clear(){
        let _this = this;
        this.entities.forEach(entity => {
            _this.destroyEntity(entity);
        });
        this.nextId = 0;
    }
    createEntity(){
        let entity = new Entity(this.nextId++);
        this.entities = this.capacity(this.entities, entity.id);
        this.entities[entity.id] = entity;
        return entity;
    }
    destroyEntity(entity){
        if(entity.id < this.entities.length){
            this.entities[entity.id] = null;
            for (let cls of this.componentMap.keys()) {
                this.removeComponent(entity.id,cls);
            }
        }
    }
    getEntity(id){
        if(id < this.entities.length) return this.entities[id];
        return null;
    }
    exists(entity) {
        return entity.id < this.entities.length && this.entities[entity.id];
    }
    addComponent(entity, cls, ...args){
        if(this.hasComonent(entity,cls)){
            error("already add component.");
            return;
        }
        let arr = this.getComponents(cls);
        arr = this.capacity(arr, entity.id);
        arr[entity.id] = new cls(...args);
        if(!this.componentCountMap.has(cls))this.componentCountMap.set(cls,0);
        this.componentCountMap.set(cls,this.componentCountMap.get(cls) + 1);
        return arr[entity.id];
    }
    getComponent(entity, cls){
        let arr = this.getComponents(cls);
        if(entity.id<arr.length) return arr[entity.id];
        return null;
    }
    removeComponent(entity, cls){
        let arr = this.getComponents(cls);
        if(entity.id < arr.length){
            arr[entity.id] = null;
        }
        if(!this.componentCountMap.has(cls))this.componentCountMap.set(cls,0);
        this.componentCountMap.set(cls,this.componentCountMap.get(cls) - 1);
    }
    hasComonent(entity,cls){
        return entity && this.componentMap.has(cls) && this.componentMap.get(cls).length > entity.id && this.componentMap.get(cls)[entity.id];
    }
    hasComponents(entity,clsList){
        let has = clsList.length > 0;
        for(let i = 0; i < clsList.length; ++i){
            let cls = clsList[i];
            if(!this.hasComonent(entity,cls)){
                has = false;
                break;
            }
        }
        return has;
    }
    getComponents(cls){
        if(!this.componentMap.has(cls)) this.componentMap.set(cls,[]);
        return this.componentMap.get(cls);
    }
    capacity(arr, index){
        if(arr.length <= index){
            let size = 8;
            if(arr.length < 1) size = 8;
            while(size <= index) size *= 2;
            for(let i = arr.length; i < size; ++i){
                arr.push(null);
            }
        }
        return arr;
    }
    query(ret,...clsList){
        ret.splice(0, ret.length);
        if(true){
            let min = -1;
            let firstCls = null;
            for(let i = 0; i < clsList.length; ++i){
                let cls = clsList[i];
                if(min == -1 || min > this.componentCountMap.has(cls)){
                    min = this.componentCountMap.get(cls);
                    firstCls = cls;
                }
            }
            if(firstCls)
            {
                let cls = firstCls;
                let components = this.getComponents(cls);
                for(let n = 0; n < components.length; ++n){
                    let component = components[n];
                    if(component){
                        let entity = this.entities[n];
                        if(entity){
                            if(this.hasComponents(entity, clsList)){
                                ret.push(entity);
                            }
                        }
                    }
                }
            }
        }
        if(false){
            for(let n = 0; n < this.entities.length; ++n){
                let entity = this.entities[n];
                if(entity){
                    if(this.hasComponents(entity, clsList)){
                        ret.push(entity);
                    }
                }
            }
        }
        return ret;
    }
}