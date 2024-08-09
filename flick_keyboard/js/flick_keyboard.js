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
        this.width = 5;
        this.height = 5;
        this.create();
    }
    create(){
        while( this.root.firstChild ){
            this.root.removeChild( this.root.firstChild );
        }
        this.panels = [];
        for(let i = 0; i < this.width * this.height; ++i) this.panels[i] = null;
        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                this.root.appendChild(this.createPanel(x,y));
            }
        }
    }
    createPanel(x,y){
        let root = document.createElement("div");
        root.classList.add("keyboard-panel");
        root.style.top = y*52 + "px";
        root.style.left = x*52 + "px";
        let panel = {};
        panel.x = x;
        panel.y = y;
        panel.element = root;
        panel.items = {};
        root.appendChild(this.createItem(panel,panel.items,"center"));
        root.appendChild(this.createItem(panel,panel.items,"up"));
        root.appendChild(this.createItem(panel,panel.items,"down"));
        root.appendChild(this.createItem(panel,panel.items,"left"));
        root.appendChild(this.createItem(panel,panel.items,"right"));
        this.panels[x + y*this.width] = panel;
        return root;
    }
    createItem(panel,items,type){
        let item = {};
        let root = document.createElement("div");
        root.textContent = "あ";
        root.classList.add("keyboard-item");
        root.classList.add("keyboard-item-" + type);
        item.parent = panel;
        item.element = root;
        item.type = type;
        items[type] = item;
        if(type == "center"){
            this.addEvent(item);
        }
        else{
            root.classList.add("hidden");
        }
        return root;
    }
    addEvent(item){
        let _this = this;
        item.element.addEventListener("mousedown", (e) => {
            e.preventDefault();
            _this.onMouseDown(item,e.pageX,e.pageY);
        });
        item.element.addEventListener("mouseup", (e) => {
            e.preventDefault();
            _this.onMouseUp(item,e.pageX,e.pageY);
        });
        item.element.addEventListener("mousemove", (e) => {
            e.preventDefault();
            _this.onMouseMove(item,e.pageX,e.pageY);
        });
        item.element.ontouchstart = (e) => {
            e.preventDefault();
            _this.onMouseDown(item,e.changedTouches[0].pageX,e.changedTouches[0].pageY);
        };
        item.element.ontouchend = (e) => {
            e.preventDefault();
            _this.onMouseUp(item,e.changedTouches[0].pageX,e.changedTouches[0].pageY);
        };
        item.element.ontouchmove = (e) => {
            e.preventDefault();
            _this.onMouseMove(item,e.changedTouches[0].pageX,e.changedTouches[0].pageY);
        };
        item.element.ontouchcancel = (e) => {
            e.preventDefault();
            _this.onMouseUp(item,e.changedTouches[0].pageX,e.changedTouches[0].pageY);
        };
    }
    onMouseDown(item,x,y){
        if(this.ctrlItem == null)
        {
            this.ctrlItem = item;
            this.startPos = {x:x,y:y};
            this.currentPos = {x:x,y:y};
            this.ctrlItem.element.classList.remove(".keyboard-item-select");
            this.ctrlItem.element.classList.add(".keyboard-item-select");
            this.updatePanel(this.ctrlItem.parent,x,y,true);
            console.log(`onMouseDown: ${item.type} ${x},${y}`);
        }
    }
    onMouseUp(item,x,y){
        if(this.ctrlItem)
        {
            this.ctrlItem.element.classList.remove(".keyboard-item-select");
            this.updatePanel(this.ctrlItem.parent,x,y,false);
            this.endPos = {x:x,y:y};
            this.currentPos = {x:x,y:y};
            console.log(`onMouseUp: ${item.type} ${x},${y}`);
            this.ctrlItem = null;
        }
    }
    onMouseMove(item,x,y){
        if(this.ctrlItem)
        {
            this.updatePanel(this.ctrlItem.parent,x,y,true);
            this.currentPos = {x:x,y:y};
            console.log(`onMouseMove: ${item.type} ${x},${y}`);
        }
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
        
        panel.items.center.element.classList.remove("hidden");
        panel.items.up.element.classList.add("hidden");
        panel.items.down.element.classList.add("hidden");
        panel.items.right.element.classList.add("hidden");
        panel.items.left.element.classList.add("hidden");

        if(isCtrl){
            let rate = this.getInsideRate(panel.element, x,y);
            let normalRate = normalize(rate.x*2-1,rate.y*2-1);
            let angle = calcAngle(normalRate.x,-normalRate.y);
            console.log(angle)
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
            panel.items[way].element.classList.remove("hidden");
        }
        
    }
}