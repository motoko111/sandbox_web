import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
        });
        this.renderer.setSize(width, height);

        // シーン
        this.scene = new THREE.Scene();

        // カメラ
        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        this.camera.position.set(0,10,20);
        this.scene.add(this.camera);

        // カメラ操作
        //this.controls = new OrbitControls(this.camera, canvasElement);

        // グリッド
        this.gridHelper = new THREE.GridHelper(50,50);
        this.scene.add(this.gridHelper);

        // 方向
        this.axesHelper = new THREE.AxesHelper(180);
        this.scene.add(this.axesHelper);
    }
    clear(){
        if(this.scene){
            // todo
        }
    }
    update(){
        this.renderer.render(this.scene, this.camera);
    }
    onResize(w,h){
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    getCameraForward(){
        this.camera.getWorldDirection(cameraForward);
        return cameraForward;
    }
    getCameraRight(){
        this.camera.matrixWorld.extractBasis(cameraRight, temp1, temp2);
        return cameraRight;
    }
}

export { ThreeRender }