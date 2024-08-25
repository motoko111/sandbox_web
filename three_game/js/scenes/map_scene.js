import * as THREE from "three";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
import { ModelLoader } from "../utils/model_loader.js";
import { ModelComponent } from "../ecs/components/model_component.js";
import { InstancedMeshComponent, InstancedMeshObjectComponent } from "../ecs/components/instanced_mesh_component.js";
import { PhysicsInstancedSystem } from "../ecs/systems/physics_instanced_system.js";
import { ThreePhysics } from "../three_physics.js";
import { TextureUtils } from "../utils/texture_utils.js";
import { Blocks, BlockUtils } from "../object/blocks.js";
import { BlockWorld } from "../object/block_world.js";
import { SimpleSystem } from "../ecs/systems/simple_system.js";
import { BlockWorldComponent } from "../ecs/components/block_world_component.js";
import { EditWorldSystem } from "../ecs/systems/edit_world_system.js";

export class MapScene extends GameScene{
    constructor(){
        super();
    }
    async load(){
        let _this = this;

        await ThreeRender.getInstance().init();

        const controls = ThreeRender.getInstance().controls;
        controls.mouseButtons = {
            LEFT: null, 
            MIDDLE: THREE.MOUSE.ROTATE, 
            RIGHT: null, 
        };
        controls.keys = {
            LEFT: 'KeyA',
            RIGHT: 'KeyD',
            UP: 'KeyW',
            BOTTOM: 'KeyS',
        }
        controls.target.set(16,0,16);
        controls.update();
        
        let em = this.world.entityManager;


        const imageLoader = new THREE.ImageLoader();
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
        const tex_box = pixelTex( texLoader.load( "./assets/model/quad6_uv.png" ) );
        //const tex_box = pixelTex( texLoader.load( "./assets/tile_000.png" ) );

        let model = await ModelLoader.load("./assets/model/quad6.glb");
        const image = await imageLoader.loadAsync("./assets/map_000.png");
        const ret = TextureUtils.getPixeldData(image);
        const width = ret.width;
        const height = ret.height;
        const imageData = ret.data;
            
        // model
        /*
        {
            let w = width;
            let h = 10;
            let d = height;
            let count = w * h * d;
            let geometry = new THREE.BoxGeometry(1,1,1);
            let block = Blocks.grass_6;
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(block.uvs, 2));
            const instancedMesh = new THREE.InstancedMesh(geometry, block.materials, count);
            instancedMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
            let entity = _this.addEntity(instancedMesh);
            let instancedMeshComp = em.addComponent(entity, InstancedMeshComponent, instancedMesh);
            let param = model.getVerticies();
            let index = 0;
            for(let z = 0; z < height; ++z){
                for(let x = 0; x < width; ++x){
                    let r = imageData[(x + z * width)*4+0];
                    let g = imageData[(x + z * width)*4+1];
                    let b = imageData[(x + z * width)*4+2];
                    let a = imageData[(x + z * width)*4+3];
                    //console.log(`${r} ${g} ${b} ${a}`);
                    let hh = 0 + (10 * r / 255);
                    for(let y = 0; y < hh; y++){
                        let childEntity = em.createEntity();
                        em.addComponent(childEntity, InstancedMeshObjectComponent, entity, index);
                        let body = em.addComponent(childEntity, BodyComponent, "fixed", "box", 0.5,0.5,0.5);
                        body.setPosition(x-width/2,y,z-height/2);
                        index++;
                    }
                }
            }
        }
        */

        {
            this.blockWorld = new BlockWorld();
            if(this.blockWorld.containsData("block_world_data")){
                this.blockWorld.load();
            }
            else{
                this.blockWorld.generate();
                let w = width;
                let h = 10;
                let d = height;
                for(let z = 0; z < height; ++z){
                    for(let x = 0; x < width; ++x){
                        let r = imageData[(x + z * width)*4+0];
                        let g = imageData[(x + z * width)*4+1];
                        let b = imageData[(x + z * width)*4+2];
                        let a = imageData[(x + z * width)*4+3];
                        let hh = 0 + (10 * r / 255);
                        for(let y = 0; y < hh; y++){
                            this.blockWorld.addBlock(x,y,z,BlockUtils.random().id)
                        }
                    }
                }
            }
           
            let entity = _this.addEntity(this.blockWorld);
            em.addComponent(entity, BlockWorldComponent, this.blockWorld);
        }

        // systems
        this.world.createSystem(EditWorldSystem, em);
        this.world.createSystem(PhysicsSystem, em);
        this.world.createSystem(PhysicsInstancedSystem, em);
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
        {
            let worldFolder = gui.addFolder("block world");
            let edit = this.blockWorld.edit;
            worldFolder.add(edit,"blockId").disable().listen();
        }
        ThreeRender.getInstance().addDebugGUI(gui);
        ThreePhysics.getInstance().setupDebug(ThreeRender.getInstance().scene);
        ThreePhysics.getInstance().addDebugGUI(gui);
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