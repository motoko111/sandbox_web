export class ObjectPool {
    constructor(initCount, onRequire, onDestroy){
        this.items = [];
        this.itemMap = new Map();
        this.onRequire = onRequire;
        this.onDestroy = onDestroy;
        for(let i = 0; i < initCount; ++i){
            this.createItem();
        }
    }
    createItem(){
        let item = {isUse:false,obj:this.onRequire()};
        this.items.push(item);
        this.itemMap.set(item.obj, item);
    }
    getItem(){
        for(let i = 0; i < this.items.length; ++i){
            if(!this.items[i].isUse){
                let item = this.items[i];
                item.isUse = true;
                return item.obj;
            }
        }
        this.createItem();
        let item  =this.items[this.items.length-1];
        item.isUse = true;
        return item.obj;
    }
    unused(obj){
        this.itemMap.get(obj).isUse = false;
    }
    clear(){
        for(let i = this.items.length-1; i >= 0; --i){
            let item = this.items[i];
            this.onDestroy(item.obj);
            this.items.splice(i,1);
        }
    }
}