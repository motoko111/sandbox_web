import {Entity} from "./enitty.js";

export class EntityManager{
    constructor(){
        this.nextId = 0;
        this.entities = [];
        this.componentMap = {};
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
        }
    }
    exists(entity) {
        return entity.id < this.entities.length && this.entities[entity.id];
    }
    addComponent(entity, cls, ...args){
        let arr = this.getComponents(cls);
        arr = this.capacity(arr, entity.id);
        arr[entity.id] = new cls(...args);
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
    }
    hasComonent(entity,cls){
        return entity && this.componentMap[cls] && this.componentMap[cls].length > entity.id && this.componentMap[cls][entity.id];
    }
    getComponents(cls){
        if(!this.componentMap[cls]) this.componentMap[cls] = [];
        return this.componentMap[cls];
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
        for(let n = 0; n < this.entities.length; ++n){
            let entity = this.entities[n];
            if(entity){
                let add = true;
                for(let i = 0; i < clsList.length; ++i){
                    let cls = clsList[i];
                    if(!this.hasComonent(entity,cls)){
                        add = false;
                    }
                }
                if(add){
                    ret.push(entity);
                }
            }
        }
        return ret;
    }
}