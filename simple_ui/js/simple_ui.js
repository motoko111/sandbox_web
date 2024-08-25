class SimpleUINode {
    constructor(){
        this.parent = null;
        this.children = [];
    }
    add(node){
        node.parent = this;
        if(this.container && node.element){
            this.container.appendChild(node.element);
        }
        this.children.push(node);
    }
    remove(node){
        if(this.container && node.element){
            this.container.removeChild(node.element);
        }
        this.children = this.children.filter(n => n !== node);
    }
    clear(){
        this.container.clear();
        this.children.splice(0,this.children.length);
    }
    createDom(){
    }
}

class SimpleUIContainer extends SimpleUINode {
    constructor(){
        super();
        this.element = this.createDom();
        this.container = this.element;
    }
    createDom()
    {
        let root = document.createElement("div");
        return root;
    }
}

class SimpleUI extends SimpleUINode {
    constructor(){
        super();
        this.init();
    }
    init(){
        this.rootDiv = document.getElementById("simple-ui-root");
        this.uiDiv = document.getElementById("simple-ui");
        this.element = this.createDom();
        this.container = this.element;
        this.uiDiv.appendChild(this.element);
    }
    createDom()
    {
        let root = document.createElement("div");
        root.classList.add("container");
        return root;
    }
}

class SimpleUIButton extends SimpleUINode {
    constructor(label, onClick){
        super();
        this.label = label;
        this.onClick = onClick;
        this.element = this.createDom();
    }
    createDom()
    {
        let root = document.createElement("div");
        let button = document.createElement("button");
        root.classList.add("item");
        button.textContent = this.label;
        button.onclick = this.onClick;
        root.appendChild(button);
        return root;
    }
}

export {SimpleUI, SimpleUIButton}