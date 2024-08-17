import * as THREE from "three";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import { BodyComponent } from "../ecs/components/body_component.js";
import { AddObjectTag, ObjectComponent } from "../ecs/components/object_component.js";
import { PhysicsSystem } from "../ecs/systems/physics_system.js";
import { RenderSystem } from "../ecs/systems/render_system.js";
import { GameScene } from "../three_game.js";
import { RenderResizeEvent } from "../ecs/components/events.js";
import {Input,EInputKey} from "../input.js";
import { ActiveTag, CoinTag, PlayerTag, WallTag } from "../ecs/components/tags.js";
import { ControlSystem } from "../ecs/systems/control_system.js";
import { ThreeRender } from "../three_render.js";
import { MoveComponent } from "../ecs/components/move_component.js";
import { MoveSystem } from "../ecs/systems/move_system.js";
import { SinMoveComponent } from "../ecs/components/sin_move_component.js";
import { SpawnSystem } from "../ecs/systems/spawn_system.js";
import { DeleteCoinSystem } from "../ecs/systems/delete_coin_system.js";
import { ObjectPool } from "../utils/object_pool.js";

export class CoinPusherScene extends GameScene{
    constructor(){
        super();
    }
    async load(){
        let _this = this;

        await ThreeRender.getInstance().init();
        
        let em = this.world.entityManager;
        this.score = 0;

        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(80, 100, 0).normalize();
        _this.addEntity(light);

        let floor = (x,y,z ,w,h,d, opt) => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w,h,d),
            new THREE.MeshNormalMaterial());

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "fixed", "box", w/2,h/2,d/2);
            em.addComponent(entity, WallTag);
            body.setPosition(x,y,z);
            return entity;
        };
        let size = 20;
        let height = 10;
        floor(0,0,0, size*2,1,size);
        floor(0,height/2,-size/2, size*2,height,1);
        let push = floor(0,height/2,-size/2, size*2,height/2,1);
        em.addComponent(push, SinMoveComponent, {x:0,y:height/2,z:-size/2}, {x:0,y:0,z:4}, 1.0);

        let right = floor(size/2,height/2,0, 1,height,size);
        let left = floor(-size/2,height/2,0, 1,height,size);
        em.addComponent(right, SinMoveComponent, {x:size/2,y:height/2,z:0}, {x:2,y:0,z:0}, 1.4);
        em.addComponent(left, SinMoveComponent, {x:-size/2,y:height/2,z:0}, {x:-2,y:0,z:0}, 1.2);

        let coin = (x,y,z ,w,h,d) => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshNormalMaterial());

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "dynamic", "box", w/2,h/2,d/2);
            em.addComponent(entity, CoinTag);
            body.setPosition(x,y,z);
            return entity;
        };
        // for(let i = 0; i < 500; i++) coin(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 20 - 10, 2,0.2,2);
        
        let pool = new ObjectPool(500, () => {
            let entity = coin(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 20 - 10, 2,0.2,2);
            em.addComponent(entity, ActiveTag);
            return entity;
        }, (entity) => {
            _this.destroy(entity);
        });

        let createPlayer = () => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalMaterial());

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "dynamic", "box", 0.5, 0.5, 0.5);
            body.setPosition(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 20 - 10);
            em.addComponent(entity, PlayerTag);
            em.addComponent(entity, MoveComponent);
            return entity;
        }
        let player = createPlayer();

        this.world.createSystem(ControlSystem, em);
        this.world.createSystem(MoveSystem, em);
        this.world.createSystem(SpawnSystem, em, () => {
            let entity = pool.getItem();
            let body = em.getComponent(entity, BodyComponent);
            let pbody = em.getComponent(player, BodyComponent);
            let ppos = pbody.rigidbody.translation();
            body.rigidbody.setBodyType(RAPIER.RigidBodyType.Dynamic);
            body.setPosition(Math.sin(GetElapsedTime()) * 10,10,10);
            body.setVelocity(0,0,-10);
        });
        this.world.createSystem(DeleteCoinSystem, em, (entity) => {
            pool.unused(entity);
            em.removeComponent(entity, ActiveTag);
            let body = em.getComponent(entity, BodyComponent);
            body.setPosition(-1000,-1000,1000); // 見えないところ
            body.rigidbody.setBodyType(RAPIER.RigidBodyType.Fixed);
            _this.score += 10;
        });
        this.world.createSystem(PhysicsSystem, em);
        this.world.createSystem(RenderSystem, em);

        this.setupDebug();
    }
    setupDebug(){
        let gui = new GUI();
        let em = this.world.entityManager;
        if(true){
            const folder = gui.addFolder( 'entity' );
            folder.add(em.entities, 'length').listen().disable();
        }
        if(true){
            const folder = gui.addFolder( 'game' );
            folder.add(this, 'score').listen().disable();
        }
    }
    update(dt){
        super.update(dt);
    }
    onDestroy(){
        ThreeRender.getInstance().clear();
    }
}