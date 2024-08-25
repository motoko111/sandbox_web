import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ThreeDemo {
    constructor(){
        this.init();
    }
    async init(){
        if(this.scene) return;
        
        let _this = this;

        // サイズを指定
        const width = window.innerWidth;
        const height = window.innerHeight;

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
        this.scene.background = new THREE.Color( 0x222222 );

        // カメラ
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 10000);
        this.camera.position.set(0,1,2);
        this.scene.add(this.camera);

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

        // 方向
        this.axesHelper = new THREE.AxesHelper(180);

        // 立方体を作成
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        window.addEventListener("resize",()=>{
            _this.onResize(window.innerWidth,window.innerHeight);
        });
        let tick = () => {
            _this.update();
            requestAnimationFrame(tick);
        };
        tick();
    }
    update(){
        this.renderer.render(this.scene, this.camera);
    }
    onResize(w,h){
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }
}