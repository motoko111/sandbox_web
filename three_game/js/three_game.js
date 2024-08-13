import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
const clock = new THREE.Clock()

class GameScene{
    constructor(){
    }
    load(){
        // サイズを指定
        const width = GetScreenWidth();
        const height = GetScreenHeight();

        // レンダラーを作成
        const canvasElement = document.querySelector('#threeCanvas')
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElement,
        });
        this.renderer.setSize(width, height);

        this.scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        camera.position.set(0,0,10);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 100).normalize();
        this.scene.add(light);

        const controls = new OrbitControls(camera, canvasElement);

        const gridHelper = new THREE.GridHelper(50,50);
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(180);
        this.scene.add(axesHelper);

        const directionalLightHelper = new THREE.DirectionalLightHelper(light, 1);
        //scene.add(directionalLightHelper);

        const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial());
        this.scene.add(mesh);

        this.camera = camera;
        this.light = light;
        this.controls = controls;

        this.setupDebug();
    }
    setupDebug(){
        let gui = new GUI();
        const folder = gui.addFolder( 'camera' );
        folder.add(this.camera.position, 'x', -10, 10).onChange(v => {

        });
        folder.add(this.camera.position, 'y', -10, 10).onChange(v => {

        });
        folder.add(this.camera.position, 'z', -10, 10).onChange(v => {

        });
        gui.add(folder);
    }
    update(dt){
    }
    draw(){
        this.renderer.render(this.scene, this.camera);
    }
    destroy(){
    }
    onResize(w,h){
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }
}

class ThreeGameEngine {
    constructor(){
        this.gameScene = new GameScene();
        this.gameScene.load();
        SetElapsedTime(0);
        let _this = this;
        let tick = () => {
            const now = clock.getElapsedTime();
            let dt = now - GetElapsedTime();
            SetElapsedTime(now);
            SetDeletaTime(dt);
            if(_this.gameScene && _this.gameScene.update) _this.gameScene.update(dt);
            if(_this.gameScene && _this.gameScene.draw) _this.gameScene.draw();
            requestAnimationFrame(tick);
        };
        tick();
    }
    onResize(w,h){
        this.gameScene.onResize(w,h);
    }
}

export {ThreeGameEngine};