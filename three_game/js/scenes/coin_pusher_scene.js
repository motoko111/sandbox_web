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

        const texLoader = new THREE.TextureLoader();
        let pixelTex = (tex) => {
            tex.minFilter = THREE.NearestFilter
            tex.magFilter = THREE.NearestFilter
            tex.generateMipmaps = false
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.RepeatWrapping
            return tex
        };
        const tex_floor = pixelTex( texLoader.load( "./assets/checker.png" ) );
        const tex_box = pixelTex( texLoader.load( "./assets/cockey.png" ) );
        tex_floor.repeat.set( 1.5, 1.5 );
        let floorMaterial = new THREE.MeshPhongMaterial( { map: tex_floor } );
        let boxMaterial = new THREE.MeshPhongMaterial( { map: tex_box } );
        //let floorMaterial = new THREE.MeshStandardMaterial(  );
        //let boxMaterial = new THREE.MeshStandardMaterial(  );

        let floor = (x,y,z ,w,h,d, opt) => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w,h,d),
            floorMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "fixed", "box", w/2,h/2,d/2);
            em.addComponent(entity, WallTag);
            body.setPosition(x,y,z);
            return entity;
        };
        let size = 20;
        let height = 10;
        floor(0,0,0, size*2,1,size*2);
        floor(0,height,-size, size*2,height*2,1);
        let push = floor(0,height/4,-size/2, size*2,height/2,16);
        em.addComponent(push, SinMoveComponent, {x:0,y:height/4,z:-size/2-6}, {x:0,y:0,z:4}, 1.0);

        let right = floor(size*0.75,height/2,0, 1,height,size);
        let left = floor(-size*0.75,height/2,0, 1,height,size);
        em.addComponent(right, SinMoveComponent, {x:size*0.75,y:height/2,z:0}, {x:2,y:0,z:0}, 1.4);
        em.addComponent(left, SinMoveComponent, {x:-size*0.75,y:height/2,z:0}, {x:-2,y:0,z:0}, 1.2);

        let coin = (x,y,z ,w,h,d) => {
            const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            boxMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            let entity = _this.addEntity(mesh);
            let body = em.addComponent(entity, BodyComponent, "dynamic", "box", w/2,h/2,d/2);
            em.addComponent(entity, CoinTag);
            body.setPosition(x,y,z);
            return entity;
        };
        // for(let i = 0; i < 500; i++) coin(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 20 - 10, 2,0.2,2);
        
        let pool = new ObjectPool(500, () => {
            let entity = coin(Math.random() * 20 - 10,Math.random() * 10,Math.random() * 10 - 5, 2,0.4,2);
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
            if(!em.hasComonent(entity, ActiveTag)){
                em.addComponent(entity, ActiveTag);
            }
            let body = em.getComponent(entity, BodyComponent);
            let pbody = em.getComponent(player, BodyComponent);
            let ppos = pbody.rigidbody.translation();
            body.rigidbody.setBodyType(RAPIER.RigidBodyType.Dynamic);
            body.setPosition(Math.sin(GetElapsedTime()) * 10,10,10);
            body.setEulerAngle(0,0,0);
            body.setVelocity(0,4,-20);
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
        this.guiParam = {};
        this.updateDebug();
        if(true){
            const folder = gui.addFolder( 'entity' );
            folder.add(em.entities, 'length').listen().disable();
        }
        if(true){
            //const folder = gui.addFolder( 'component' );
            //folder.add(this.guiParam, 'BodyComponent').listen().disable();
        }
        if(true){
            const folder = gui.addFolder( 'game' );
            folder.add(this, 'score').listen().disable();
        }
        ThreeRender.getInstance().addDebugGUI(gui);
        this.updateDebug();
    }
    updateDebug(){
        let em = this.world.entityManager;
    }
    update(dt){
        super.update(dt);
        this.updateDebug();
    }
    onDestroy(){
        ThreeRender.getInstance().clear();
    }
}