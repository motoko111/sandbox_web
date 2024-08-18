import * as THREE from "three";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { ThreePhysics } from "./three_physics.js";
import { World } from "./ecs/world.js";
import { PhysicsSystem } from "./ecs/systems/physics_system.js";
import { BodyComponent } from "./ecs/components/body_component.js";
import { RenderSystem } from "./ecs/systems/render_system.js";
import { AddObjectTag, ObjectComponent, DeleteObjectTag } from "./ecs/components/object_component.js";
import Stats from "three/addons/libs/stats.module.js";
import { ThreeRender } from "./three_render.js";
import { Input } from "./input.js";
const clock = new THREE.Clock()

class GameScene{
    constructor(){
        this.world = new World();
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        this.stats.dom.style.userSelect = 'none';
    }
    async load(){
    }
    // シーンに追加
    addEntity(obj){
        let em = this.world.entityManager;
        let entity = em.createEntity();
        em.addComponent(entity, ObjectComponent, obj);
        ThreeRender.getInstance().scene.add(obj);
        return entity;
    }
    // シーンから削除
    destroyEntity(entity){
        let em = this.world.entityManager;
        let obj = em.getComponent(entity,ObjectComponent);
        if(obj){
            if(typeof obj == THREE.Mesh){
                if(obj.material){
                    obj.material.dispose();
                }
                if(obj.geometry){
                    obj.geometry.dispose();
                }
            }
            ThreeRender.getInstance().scene.remove(obj);
        }
        em.destroyEntity(entity);
    }
    update(dt){
        Input.update(dt);
        this.stats.begin();
        this.world.update();
        this.stats.end();
    }
    destroy(){
        document.body.removeChild(this.stats.dom);
        this.world.destroy();
        this.onDestroy();
    }
    onDestroy(){
    }
    onResize(w,h){
        ThreeRender.getInstance().onResize(w,h);
    }
    keypressed(key){
        Input.keypressed(key);
    }
    keyreleased(key){
        Input.keyreleased(key);
    }
    
    gamepadpressed (btn) {
        Input.gamepadpressed(btn);
    }
    
    gamepadreleased (btn) {
        Input.gamepadreleased(btn);
    }
    
    gamepadAxis (x, y) {
        Input.gamepadAxis(x, y);
    }
    
    gamepadTurnAxis (x, y) {
        Input.gamepadTurnAxis(x, y);
    }
    
    mousepressed (x, y, btn) {
        Input.mousepressed(x, y, btn);
    }
    
    mousereleased (x, y, btn) {
        Input.mousereleased(x, y, btn);
    }
    
    wheelmoved (x, y) {
        Input.wheelmoved(x, y);
    }
    
    mousemoved (x, y, dx, dy) {
        Input.mousemoved(x, y, dx, dy);
    }
    
    touchpressed (id, x, y, dx, dy) {
        Input.touchpressed(id, x, y, dx, dy);
    }
    
    touchreleased (id, x, y, dx, dy) {
        Input.touchreleased(id, x, y, dx, dy);
    }
    
    touchmoved (id, x, y, dx, dy) {
        Input.touchmoved(id, x, y, dx, dy);
    }
}

class ThreeGameEngine {
    constructor(){
        
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
    async loadScene(cls){
        this.gameScene = new cls();
        await this.gameScene.load();
    }
    async init(){
        ThreePhysics.createInstance();
        await ThreePhysics.getInstance().init();

        SetElapsedTime(0);
        let _this = this;
        let tick = () => {
            const now = clock.getElapsedTime();
            let dt = now - GetElapsedTime();
            SetElapsedTime(now);
            SetDeletaTime(dt);
            if(_this.gameScene && _this.gameScene.update) _this.gameScene.update(dt);
            requestAnimationFrame(tick);
        };
        tick();
    }
    onResize(w,h){
        if(this.gameScene) this.gameScene.onResize(w,h);
    }

    keypressed(key){
        if(this.gameScene) this.gameScene.keypressed(key);
    }

    keyreleased(key){
        if(this.gameScene) this.gameScene.keyreleased(key);
    }
    
    gamepadpressed (btn) {
        if(this.gameScene) this.gameScene.gamepadpressed(btn);
    }
    
    gamepadreleased (btn) {
        if(this.gameScene) this.gameScene.gamepadreleased(btn);
    }
    
    gamepadAxis (x, y) {
        if(this.gameScene) this.gameScene.gamepadAxis(x,y);
    }
    
    gamepadTurnAxis (x, y) {
        if(this.gameScene) this.gameScene.gamepadTurnAxis(x,y);
    }
    
    mousepressed (x, y, btn) {
        if(this.gameScene) this.gameScene.mousepressed(x,y, btn);
    }
    
    mousereleased (x, y, btn) {
        if(this.gameScene) this.gameScene.mousereleased(x,y, btn);
    }
    
    wheelmoved (x, y) {
        if(this.gameScene) this.gameScene.wheelmoved(x,y);
    }
    
    mousemoved (x, y, dx, dy) {
        if(this.gameScene) this.gameScene.mousemoved(x,y, dx, dy);
    }
    
    touchpressed (id, x, y, dx, dy) {
        if(this.gameScene) this.gameScene.touchpressed(id, x, y, dx, dy);
    }
    
    touchreleased (id, x, y, dx, dy) {
        if(this.gameScene) this.gameScene.touchreleased(id, x, y, dx, dy);
    }
    
    touchmoved (id, x, y, dx, dy) {
        if(this.gameScene) this.gameScene.touchmoved(id, x, y, dx, dy);
    }
}

export {ThreeGameEngine,GameScene};