import * as THREE from "three";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import { BodyComponent } from "../ecs/components/body_component.js";
import { AddObjectTag, ObjectComponent } from "../ecs/components/object_component.js";
import { PhysicsSystem } from "../ecs/systems/physics_system.js";
import { RenderSystem } from "../ecs/systems/render_system.js";
import { GameScene } from "../three_game.js";
import { RenderResizeEvent } from "../ecs/components/events.js";
import {Input,EInputKey} from "../input.js";
import { PlayerTag } from "../ecs/components/tags.js";
import { ControlSystem } from "../ecs/systems/control_system.js";
import { ThreeRender } from "../three_render.js";
import { MoveComponent } from "../ecs/components/move_component.js";
import { MoveSystem } from "../ecs/systems/move_system.js";
import { SinMoveComponent } from "../ecs/components/sin_move_component.js";

export class MainScene extends GameScene{
    constructor(){
        super();
    }
    async load(){
        let _this = this;

        await ThreeRender.getInstance().init();
        
        let em = this.world.entityManager;
        this.world.createSystem(ControlSystem, em);
        this.world.createSystem(MoveSystem, em);
        this.world.createSystem(PhysicsSystem, em);
        this.world.createSystem(RenderSystem, em);

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
            let pos = body.rigidbody.translation();
            em.addComponent(entity,SinMoveComponent, {x:pos.x,y:pos.y,z:pos.z}, {x:100,y:0,z:0}, 1.0);
            return mesh;
        };
        for(let i = 0; i < 800; i++) box();

        let player = () => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalMaterial());

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "dynamic", "box", 0.5, 0.5, 0.5);
            body.setPosition(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 20 - 10);
            em.addComponent(entity, PlayerTag);
            em.addComponent(entity, MoveComponent);
            return mesh;
        }
        player();

        this.setupDebug();
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
        super.update(dt);
    }
    onDestroy(){
        ThreeRender.getInstance().clear();
    }
}