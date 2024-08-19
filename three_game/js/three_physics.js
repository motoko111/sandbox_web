import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from "three";

class ThreePhysics{
    constructor(){
    }
    static createInstance(){
        ThreePhysics.instance = new ThreePhysics();
        return ThreePhysics.instance;
    }
    static getInstance(){
        if(ThreePhysics.instance){
            return ThreePhysics.instance;
        }
        return ThreePhysics.createInstance();
    }
    async init(){
        await RAPIER.init();
        this.gravity = new RAPIER.Vector3(0.0,-9.81,0.0);
        //this.gravity = new RAPIER.Vector3(0.0,0.0,0.0);
        this.world = new RAPIER.World(this.gravity);
        this.eventQueue = new RAPIER.EventQueue(true);
    }
    update(dt){
        this.world.timestep = Math.min(dt,0.1);
        this.world.step(this.eventQueue);

        let _this = this;
        this.eventQueue.drainCollisionEvents((handle1,handle2,started) => {
            const col1 = _this.world.getCollider(handle1)
            const col2 = _this.world.getCollider(handle2)
            // console.log(`Collider ${col1} and Collider ${col2} have collided.`);
        });
        if(this.debugRenderer){
            this.debugRenderer.update();
        }
    }
    setupDebug(scene){
        this.debugRenderer = new ThreePhsyicsDebugRenderer(scene, this.world);
        this.debugRenderer.enabled = false;
    }
    addDebugGUI(gui){
        let physicsFolder = gui.addFolder("physics");
        if(this.debugRenderer)
        {
            let folder = physicsFolder.addFolder("debug renderer");
            folder.add(this.debugRenderer, "enabled");
        }
    }
}

class ThreePhsyicsDebugRenderer{
    constructor(scene, world) {
        this.world = world
        this.enabled = true;
        this.mesh = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true }))
        this.mesh.frustumCulled = false
        scene.add(this.mesh)
      }
    
      update() {
        if (this.enabled) {
          const { vertices, colors } = this.world.debugRender()
          this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
          this.mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
          this.mesh.visible = true
        } else {
          this.mesh.visible = false
        }
      }
}

export { ThreePhysics }