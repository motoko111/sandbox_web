import * as THREE from "three";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { ThreePhysics } from "./three_physics.js";
import { World } from "./ecs/world.js";
import { PhysicsSystem } from "./ecs/systems/physics_system.js";
import { BodyComponent } from "./ecs/components/body_component.js";
import { RenderSystem } from "./ecs/systems/render_system.js";
import { AddObjectTag, ObjectComponent } from "./ecs/components/object_component.js";
import Stats from "three/addons/libs/stats.module.js";
const clock = new THREE.Clock()

class GameScene{
    constructor(){
    }
    load(){
        let _this = this;

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        
        this.world = new World();
        let em = this.world.entityManager;
        this.world.createSystem(PhysicsSystem, em);
        this.world.createSystem(RenderSystem, em);
        let entity = em.createEntity();
        let body = em.addComponent(entity, BodyComponent);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 100).normalize();
        _this.addEntity(light);

        let floor = () => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(100, 1, 100),
            new THREE.MeshNormalMaterial());

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "fixed", "box", 50, 0.5, 50);
            body.collider.setTranslation(0,0,0);
            return mesh;
        };
        floor();

        let box = () => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalMaterial());

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "dynamic", "box", 0.5, 0.5, 0.5);
            body.setPosition(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 20 - 10);
            return mesh;
        };
        for(let i = 0; i < 800; i++) box();

        this.setupDebug();
    }
    addEntity(obj){
        let em = this.world.entityManager;
        let entity = em.createEntity();
        em.addComponent(entity, ObjectComponent, obj);
        em.addComponent(entity, AddObjectTag);
        return entity;
    }
    setupDebug(){
        let gui = new GUI();
        if(false){
            const folder = gui.addFolder( 'camera.position' );
            folder.add(this.camera.position, 'x', -10, 10);
            folder.add(this.camera.position, 'y', -10, 10);
            folder.add(this.camera.position, 'z', -10, 1000);
            gui.add(folder);
        }
        if(false){
            const folder = gui.addFolder( 'light.rotation' );
            folder.add(this.light.rotation, 'x', -1, 1);
            folder.add(this.light.rotation, 'y', -1, 1);
            folder.add(this.light.rotation, 'z', -1, 1);
            gui.add(folder);
        }
    }
    update(dt){
        this.stats.begin();
        this.world.update();
        this.stats.end();
    }
    draw(){
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
    }
    static createInstance(){
        ThreeGameEngine.instance = new ThreeGameEngine();
        return ThreeGameEngine.instance;
    }
    static getInstance(){
        if(ThreeGameEngine.instance){
            return ThreeGameEngine.instance;
        }
        return ThreeGameEngine.createInstance();
    }
    async init(){
        ThreePhysics.createInstance();
        await ThreePhysics.getInstance().init();

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