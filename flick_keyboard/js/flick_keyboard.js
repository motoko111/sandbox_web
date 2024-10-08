let normalize = (x,y) => 
{
    // ベクトルの長さを計算
    let length = Math.sqrt(x * x + y * y);
    
    // 長さが0の場合、(0, 0) のベクトルに正規化することはできないので、そのまま返す
    if (length === 0) {
        return { x: 0, y: 0 };
    }
    
    // 正規化された x, y を計算
    let normalizedX = x / length;
    let normalizedY = y / length;
    
    return { x: normalizedX, y: normalizedY };
}
let calcAngle = (x,y) => {
    // atan2関数を使用して角度を計算（ラジアン単位）
    let angleRadians = Math.atan2(y, x);
    
    // ラジアンを度に変換
    let angleDegrees = angleRadians * (180 / Math.PI);
    
    // 角度が負の場合、360度を加えて正の角度に変換
    if (angleDegrees < 0) {
        angleDegrees += 360;
    }

    return angleDegrees;
};

class MultiKeyboard {
    constructor(rootId){
        this.root = document.getElementById(rootId);
        this.enableLog = false;
        this.keyboard_console_log = document.getElementById("keyboard_console_log");
        this.keyboard_console_logs = [];
        this.width = 5;
        this.height = 4;
        this.params = [["あ","い","う","え","お"]];
        this.inputMap = {};
        this.ctrlKeyInfos = {};
        let _this = this;
        window.addEventListener("resize", () => _this.onResize);
        this.keyEvents = {};
        this.defaultTriggerType = "up";
        this.defaultKeyEvent = (txt) => {
            console.log(txt);
        };
        this.textCustomFunc = null;
        this.create();
    }
    log(txt){
        if(!this.enableLog) return;
        console.log(txt);
        this.keyboard_console_logs.push(txt);
        if(this.keyboard_console_logs.length > 15) this.keyboard_console_logs.splice(0,this.keyboard_console_logs.length-15);
        if(this.keyboard_console_log){
            let _this = this;
            this.keyboard_console_log.innerHTML = "";
            this.keyboard_console_logs.forEach((t)=>{
                _this.keyboard_console_log.innerHTML += t + "</br>"
            });
        }
    }
    loadJson(json){
        let obj = JSON.parse(json);
        this.width = obj.width;
        this.height = obj.height;
        this.defaultTriggerType = obj.defaultTriggerType ? obj.defaultTriggerType : "up";
        this.params = obj.params;
        this.create();
    }
    create(){
        this.updateSize();
        while( this.root.firstChild ){
            this.root.removeChild( this.root.firstChild );
        }
        this.panels = [];
        this.itemElementMap = {};
        for(let i = 0; i < this.width * this.height; ++i) this.panels[i] = null;
        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                let index = x + y * this.width;
                if(index < this.params.length){
                    this.inputMap[index] = this.params[index];
                    //console.log(this.inputMap[index] + " :" + index)
                }
                else{
                    this.inputMap[index] = null;
                }
                this.root.appendChild(this.createPanel(x,y));
            }
        }
    }
    updateSize(){
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        if(windowHeight < windowWidth){
            windowWidth = windowHeight;
        }
        this.cellSize = {x:0,y:0};
        this.cellPadding = windowWidth*0.015;
        this.cellSize.x = windowWidth/5 - this.cellPadding;
        this.cellSize.y = this.cellSize.x * 0.7;
        this.offset = {x:-this.cellSize.x,y:-this.cellSize.y};
        this.child_offset = this.cellSize.x * 0.08;
        this.root.style.width = (this.cellSize.x + this.cellPadding) * (this.width ) + "px";
        this.root.style.height = (this.cellSize.y + this.cellPadding) * (this.height ) + "px";
    }
    // テキスト描画の更新
    updateText(){
        let types = ["center","up","down","left","right"];
        this.panels.forEach((panel) => {
            types.forEach((type) => {
                let param = this.getItemParam(panel.x, panel.y, type);
                if(!param) return;
                let item = panel.items[type];
                if(!item) return;
                item.element.textContent = param.text;
                if(this.textCustomFunc) item.element.textContent = this.textCustomFunc(param, panel.x,panel.y,type);
            });
        });
    }
    createPanel(x,y){
        let root = document.createElement("div");
        root.classList.add("keyboard-panel");
        root.style.width = this.cellSize.x * 3 + "px";
        root.style.height = this.cellSize.y * 3 + "px";
        root.style.top = this.cellPadding/2 + y*(this.cellSize.y + this.cellPadding) + this.offset.y + "px";
        root.style.left = this.cellPadding/2 + x*(this.cellSize.x + this.cellPadding) + this.offset.x + "px";
        let panel = {};
        panel.x = x;
        panel.y = y;
        panel.element = root;
        panel.items = {};
        let center = this.createItem(panel,panel.items,"center");
        let up = this.createItem(panel,panel.items,"up");
        let down = this.createItem(panel,panel.items,"down");
        let left = this.createItem(panel,panel.items,"left");
        let right = this.createItem(panel,panel.items,"right");
        if(center) root.appendChild(center);
        if(up) root.appendChild(up);
        if(down) root.appendChild(down);
        if(left) root.appendChild(left);
        if(right) root.appendChild(right);
        this.panels[x + y*this.width] = panel;
        return root;
    }
    createItem(panel,items,type){
        let item = {};
        let param = this.getItemParam(panel.x, panel.y, type);
        if(param == null) return null;
        let txt = param.text;
        let widthRate = param.width ? param.width : 1;
        let heightRate = param.height ? param.height : 1;
        let root = document.createElement("div");
        if(this.textCustomFunc) txt = this.textCustomFunc(param, panel.x,panel.y,type);
        root.textContent = txt;
        root.id = "keyboard_item_" + panel.x + "_" + panel.y + "_" + type;
        root.style.width = this.cellSize.x * widthRate + (this.cellPadding * (widthRate - 1))+ "px";
        root.style.height = this.cellSize.y * heightRate + (this.cellPadding * (heightRate - 1))+ "px";
        root.classList.add("keyboard-item");
        root.classList.add("keyboard-item-" + type);
        if(param.class) root.classList.add(param.class);
        item.param = param;
        item.parent = panel;
        item.element = root;
        item.type = type;
        item.id = root.id;
        items[type] = item;
        this.itemElementMap[item.element.id] = item;
        let offsetY = 0;
        if(type == "center"){
            this.addEvent(item);
        }
        else{
            root.classList.add("hidden");
            root.style.height = this.cellSize.x + "px";
            offsetY = -(this.cellSize.x - this.cellSize.y)/2;
        }
        switch(type){
            case "center":{
                item.element.style.top = this.cellSize.y + "px";
                item.element.style.left = this.cellSize.x + "px";
            }break;
            case "up":{
                item.element.style.top = this.child_offset + offsetY + "px";
                item.element.style.left = this.cellSize.x + "px";
            }break;
            case "down":{
                item.element.style.bottom = this.child_offset + offsetY + "px";
                item.element.style.left = this.cellSize.x + "px";
            }break;
            case "left":{
                item.element.style.top = this.cellSize.y + offsetY + "px";
                item.element.style.left = this.child_offset + "px";
            }break;
            case "right":{
                item.element.style.top = this.cellSize.y + offsetY + "px";
                item.element.style.right = this.child_offset + "px";
            }break;
        }
        return root;
    }
    addEvent(item){
        let _this = this;
        item.element.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            let target = _this.itemElementMap[e.target.id];
            if(!target) return;
            _this.onMouseDown(target,e.pageX,e.pageY);
        });
        item.element.addEventListener("pointerup", (e) => {
            e.preventDefault();
            let target = _this.itemElementMap[e.target.id];
            if(!target) return;
            _this.onMouseUp(target,e.pageX,e.pageY);
        });
        item.element.addEventListener("pointermove", (e) => {
            e.preventDefault();
            let target = _this.itemElementMap[e.target.id];
            if(!target) return;
            _this.onMouseMove(target,e.pageX,e.pageY);
        });
        item.element.addEventListener("pointercancel", (e) => {
            e.preventDefault();
            let target = _this.itemElementMap[e.target.id];
            if(!target) return;
            _this.onMouseUp(target,e.pageX,e.pageY);
        });
        item.element.ontouchstart = (e) => {
            e.preventDefault();
            for(let i = 0; i < e.changedTouches.length; ++i) {
                _this.log(e.changedTouches[i].target.innerHTML + " start");
                let target = _this.itemElementMap[e.changedTouches[i].target.id];
                if(!target) continue;
                _this.onMouseDown(target,e.changedTouches[i].pageX,e.changedTouches[i].pageY);
            }
        };
        item.element.ontouchend = (e) => {
            e.preventDefault();
            for(let i = 0; i < e.changedTouches.length; ++i) {
                _this.log(e.changedTouches[i].target.innerHTML + " end");
                let target = _this.itemElementMap[e.changedTouches[i].target.id];
                if(!target) continue;
                _this.onMouseUp(target,e.changedTouches[i].pageX,e.changedTouches[i].pageY);
            }
        };
        item.element.ontouchmove = (e) => {
            e.preventDefault();
            for(let i = 0; i < e.changedTouches.length; ++i) {
                _this.log(e.changedTouches[i].target.innerHTML + " move");
                let target = _this.itemElementMap[e.changedTouches[i].target.id];
                if(!target) continue;
                _this.onMouseMove(target,e.changedTouches[i].pageX,e.changedTouches[i].pageY);
            }
        };
        item.element.ontouchcancel = (e) => {
            e.preventDefault();
            for(let i = 0; i < e.changedTouches.length; ++i) {
                _this.log(e.changedTouches[i].target.innerHTML + " cancel");
                let target = _this.itemElementMap[e.changedTouches[i].target.id];
                if(!target) continue;
                _this.onMouseUp(target,e.changedTouches[i].pageX,e.changedTouches[i].pageY);
            }
        };
    }
    onResize(){
        this.ctrlKeyInfos = {};
        this.create();
    }
    onMouseDown(item,x,y){
        let ctrlInfo = this.ctrlKeyInfos[item.id];
        if(!ctrlInfo){
            this.ctrlKeyInfos[item.id] = {};
            ctrlInfo = this.ctrlKeyInfos[item.id];
            ctrlInfo.item = item;
            let ctrlItem = ctrlInfo.item;
            ctrlInfo.startPos = {x:x,y:y};
            ctrlInfo.currentPos = {x:x,y:y};
            ctrlItem.element.classList.remove("keyboard-item-select");
            ctrlItem.element.classList.add("keyboard-item-select");
            this.updatePanel(ctrlItem.parent,x,y,true);
            if(item.param.triggerType == "down" || item.param.triggerType == "multi"){
                this.onKeyEvent(item.param.value, "down", item,x,y);
            }
        }
    }
    onMouseUp(item,x,y){
        let ctrlInfo = this.ctrlKeyInfos[item.id];
        if(ctrlInfo){
            let ctrlItem = ctrlInfo.item;
            if(ctrlItem)
            {
                let ctrlWayItem = ctrlInfo.wayItem;
                if(ctrlWayItem && (ctrlWayItem.param.triggerType == "up" || ctrlWayItem.param.triggerType == "multi")){
                    this.onKeyEvent(ctrlWayItem.param.value, "up", item,x,y);
                }
                ctrlItem.element.classList.remove("keyboard-item-select");
                this.updatePanel(ctrlItem.parent,x,y,false);
                ctrlInfo.endPos = {x:x,y:y};
                ctrlInfo.currentPos = {x:x,y:y};
                //console.log(`onMouseUp: ${item.type} ${x},${y}`);
                ctrlItem = null;
                this.ctrlKeyInfos[item.id] = null;
            }
        }
    }
    onMouseMove(item,x,y){
        let ctrlInfo = this.ctrlKeyInfos[item.id];
        if(ctrlInfo){
            let ctrlItem = ctrlInfo.item;
            if(ctrlItem)
            {
                this.updatePanel(ctrlItem.parent,x,y,true);
                ctrlInfo.currentPos = {x:x,y:y};
                //console.log(`onMouseMove: ${item.type} ${x},${y}`);
            }
        }
    }
    onKeyEvent(value, type, item,x,y){
        if(this.keyEvents[value]) this.keyEvents[value](type);
        if(this.defaultKeyEvent) this.defaultKeyEvent(value, type, item,x,y);
    }
    isInside(element, x, y) {
        // 要素の領域を取得
        const rect = element.getBoundingClientRect();
    
        // 座標が領域内にあるかどうかを判定
        return (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );
    }
    getInsideRate(element, x, y) {
        // 要素の領域を取得
        const rect = element.getBoundingClientRect();
    
        // 要素内での相対位置を計算
        let relativeX = (x - rect.left) / rect.width;
        let relativeY = (y - rect.top) / rect.height;
    
        // 0から1の範囲に制限
        relativeX = Math.max(0, Math.min(1, relativeX));
        relativeY = Math.max(0, Math.min(1, relativeY));
    
        return { x: relativeX, y: relativeY };
    }
    updatePanel(panel,x,y,isCtrl){
        
        this.allItemHidden(panel);

        if(isCtrl){
            let rate = this.getInsideRate(panel.element, x,y);
            let normalRate = normalize(rate.x*2-1,rate.y*2-1);
            let angle = calcAngle(normalRate.x,-normalRate.y);
            //console.log(angle)
            let way = "center";
            if(rate.x >= 0.34 && rate.x < 0.67 && rate.y >= 0.34 && rate.y < 0.67){
                way = "center";
            }
            else{
                if(angle < 45 && angle >= 0){
                    way = "right";
                }
                else if(angle < 135 && angle >= 45){
                    way = "up";
                }
                else if(angle < 225 && angle >= 135){
                    way = "left";
                }
                else if(angle < 315 && angle >= 225){
                    way = "down";
                }
                else if(angle <= 360 && angle >= 315){
                    way = "right";
                }
            }
            this.ctrlKeyInfos[panel.items["center"].id].wayItem = null;
            if(!panel.items[way]) way = "center";
            if(panel.items[way]) {
                panel.items[way].element.classList.remove("hidden");
                this.ctrlKeyInfos[panel.items["center"].id].wayItem = panel.items[way];
            }
        }
        
    }
    allItemHidden(panel){
        if(panel.items.center) panel.items.center.element.classList.remove("hidden");
        if(panel.items.up) panel.items.up.element.classList.add("hidden");
        if(panel.items.down) panel.items.down.element.classList.add("hidden");
        if(panel.items.right) panel.items.right.element.classList.add("hidden");
        if(panel.items.left) panel.items.left.element.classList.add("hidden");
    }
    getItemParam(x,y,type){
        let arr = this.inputMap[x + y * this.width];
        if(!arr) return null;
        let index = this.typeToIndex(type);
        if(arr.length <= index) return null;
        let param = arr[index];
        if(param == null || param == undefined) return param;
        if(typeof param == "string") param = {text:param};
        if(param.value == undefined) param.value = param.text;
        if(!param.triggerType) param.triggerType = this.defaultTriggerType;
        return param;
    }
    typeToIndex(type){
        switch(type){
            case "center":return 0;
            case "left":return 1;
            case "up":return 2;
            case "right":return 3;
            case "down":return 4;
        }
        return 0;
    }
}
