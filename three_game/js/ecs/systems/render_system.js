import {System} from "../system.js";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AddObjectTag, DeleteObjectTag, ObjectComponent } from "../components/object_component.js";

export class RenderSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetEntities = [];

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

        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        this.camera.position.set(0,0,10);
        this.scene.add(this.camera);

        this.controls = new OrbitControls(this.camera, canvasElement);

        this.gridHelper = new THREE.GridHelper(50,50);
        this.scene.add(this.gridHelper);

        this.axesHelper = new THREE.AxesHelper(180);
        this.scene.add(this.axesHelper);
    }

    update() {
        let _this = this;
        // Add
        this.targetEntities = this.em.query(this.targetEntities, ObjectComponent, AddObjectTag);
        this.targetEntities.forEach((entity) => {
            let objComp = _this.em.getComponent(entity, ObjectComponent);
            let obj = objComp.obj;
            _this.scene.add(obj);
            _this.em.removeComponent(entity, AddObjectTag);
        });
        // Delete
        this.targetEntities = this.em.query(this.targetEntities, ObjectComponent, DeleteObjectTag);
        this.targetEntities.forEach((entity) => {
            let objComp = _this.em.getComponent(entity, ObjectComponent);
            let obj = objComp.obj;
            _this.scene.remove(obj);
            if(typeof obj == THREE.Mesh){
                if(obj.material){
                    obj.material.dispose();
                }
                if(obj.geometry){
                    obj.geometry.dispose();
                }
            }
            _this.em.removeComponent(entity, DeleteObjectTag);
        });
        // 描画
        this.renderer.render(this.scene, this.camera);
    }
}