import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PostProcess } from "./shader/postprocess.js";

let cameraForward = new THREE.Vector3();
let cameraRight = new THREE.Vector3();
let temp1 = new THREE.Vector3();
let temp2 = new THREE.Vector3();

class ThreeRender {
    constructor(){
    }
    static createInstance(){
        ThreeRender.instance = new ThreeRender();
        return ThreeRender.instance;
    }
    static getInstance(){
        if(ThreeRender.instance){
            return ThreeRender.instance;
        }
        return ThreeRender.createInstance();
    }
    async init(){
        if(this.scene) return;
        // サイズを指定
        const width = GetScreenWidth();
        const height = GetScreenHeight();

        // レンダラーを作成
        const canvasElement = document.querySelector('#threeCanvas')
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElement,
            antialias: false
        });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;

        // シーン
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x2c5e44 );

        // カメラ
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 10000);
        this.camera.position.set(0,10,20);
        this.scene.add(this.camera);

        //this.camera = new THREE.OrthographicCamera(-480, +480, 270, -270, 1, 1000);
        //this.camera.position.set(0,10,20);
        //this.scene.add(this.camera);

        // ライト
        this.ambientLight = new THREE.AmbientLight( 0xf1f2fe , 2 );
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.directionalLight.position.set(80, 100, 0);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.set( 512, 512 );
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.left = -50;
        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLight);

        // カメラ操作
        this.controls = new OrbitControls(this.camera, canvasElement);

        // グリッド
        this.gridHelper = new THREE.GridHelper(50,50);
        //this.scene.add(this.gridHelper);

        // 方向
        this.axesHelper = new THREE.AxesHelper(180);
        //this.scene.add(this.axesHelper);

        // ポスプロ
        this.postProcess = new PostProcess(this.renderer, this.scene, this.camera, width, height);
    }
    clear(){
        if(this.scene){
            // todo
        }
    }
    update(){
        if(this.postProcess && this.postProcess.isActive()){
            this.postProcess.update();
        }
        else{
            this.renderer.render(this.scene, this.camera);
        }
        //
    }
    onResize(w,h){
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.postProcess.onResize(w,h);
    }

    getCameraForward(){
        this.camera.getWorldDirection(cameraForward);
        return cameraForward;
    }
    getCameraRight(){
        this.camera.matrixWorld.extractBasis(cameraRight, temp1, temp2);
        return cameraRight;
    }
    addDebugGUI(gui){
        let sceneFolder = gui.addFolder("scene");
        {
            sceneFolder.addColor(this.scene, "background");
        }
        let renderFolder = gui.addFolder("renderer");
        {
            let _this = this;
            renderFolder.add(this.renderer.shadowMap, "enabled").onChange((v)=>{
                _this.renderer.render(_this.scene,_this.camera);
            });
        }
        let lightFolder = gui.addFolder("light");
        {
            let folder = lightFolder.addFolder("ambientLight");
            folder.addColor(this.ambientLight, "color");
            folder.add(this.ambientLight,"intensity", 0, 10);
        }
        {
            let folder = lightFolder.addFolder("directionalLight");
            folder.addColor(this.directionalLight, "color");
            folder.add(this.directionalLight,"intensity", 0, 10);
        }
        this.postProcess.addDebugGUI(gui);
    }
}

export { ThreeRender }