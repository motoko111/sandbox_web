import { Blocks } from "./blocks.js";
import * as THREE from 'three';

class BlockData{
    constructor(id, instanceId){
        this.id = id;
        this.instanceId = instanceId;
    }
}

class BlockWorldChunk extends THREE.Group {
    constructor(w,h,d,dataStore){
        super();
        this.w = w;
        this.h = h;
        this.d = d;
        this.dataStore = dataStore;
    }
    init() {
        this.initData();
        this.load();
        this.createInstancedMesh();
    }
    initData(){
        // [x][y][z]
        this.data = [];
        for (let x = 0; x < this.w; x++) {
            const slice = [];
            for (let y = 0; y < this.h; y++) {
            const row = [];
            for (let z = 0; z < this.d; z++) {
                row.push(new BlockData(Blocks.empty.id, null));
            }
            slice.push(row);
            }
            this.data.push(slice);
        }
    }
    createInstancedMesh(){
        this.clear();
        const maxCount = this.w * this.h * this.d;
        this.instancedMeshes = {};
        Object.values(Blocks)
        .filter(block=>block.id !== Blocks.empty.id)
        .forEach(block => {
            const geometry = new THREE.BoxGeometry(1,1,1);
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(block.uvs, 2));
            const mesh = new THREE.InstancedMesh(geometry, block.materials, maxCount);
            mesh.onBeforeRender = (renderer,scene,camera,geometry,object,group) => {
                mesh.material.forEach(mat => {
                    if(mat.onBeforeRender) mat.onBeforeRender(renderer,scene,camera,geometry,object,group);
                });
            };
            mesh.name = block.id;
            mesh.count = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.instancedMeshes[block.id] = mesh;
        });

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                for (let z = 0; z < this.d; z++) {
                    const blockId = this.getBlock(x, y, z).id;

                    if (blockId === Blocks.empty.id) continue;

                    const mesh = this.instancedMeshes[blockId];
                    const instanceId = mesh.count;

                    if (!this.isBlockObscured(x, y, z)) {
                        matrix.setPosition(x, y, z);
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }

        this.add(...Object.values(this.instancedMeshes));
    }
    load(){
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                for (let z = 0; z < this.d; z++) {
                    if (this.dataStore.contains(this.position.x, this.position.z, x, y, z)) {
                        const blockId = this.dataStore.get(this.position.x, this.position.z, x, y, z);
                        this.setBlockId(x, y, z, blockId);
                    }
                }
            }
        }
    }
    
    setBlockId(x,y,z,id){
        this.data[x][y][z].id = id;
    }
    setBlockInstanceId(x,y,z,instanceId){
        this.data[x][y][z].instanceId = instanceId;
    }
    getBlock(x,y,z){
        if(!this.isBounds(x,y,z)) return null;
        return this.data[x][y][z];
    }
    addBlock(x,y,z, blockId){
        if(this.getBlock(x,y,z).id === Blocks.empty.id){
            this.setBlockId(x,y,z,blockId);
            this.addBlockInstance(x,y,z);
            this.dataStore.set(this.position.x,this.position.z, x,y,z, blockId);
        }
    }
    addBlockInstance(x,y,z){
        const block = this.getBlock(x,y,z);
        if(block && block.id !== Blocks.empty.id && block.instanceId === null){
            const mesh = this.instancedMeshes[block.id];
            const instanceId = mesh.count++;
            this.setBlockInstanceId(x,y,z, instanceId);

            const matrix = new THREE.Matrix4();
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();
        }
    }
    deleteBlockInstance(x,y,z){
        const block = this.getBlock(x,y,z);
        if(block.id === Blocks.empty.id || block.instanceId === null) return;
        const mesh = this.instancedMeshes[block.id];
        const instanceId = block.instanceId;

        // ブロックを削除すると空欄ができるので最後のデータのinstancedIdを削除するinstancedIdに変更する
        const lastMatrix = new THREE.Matrix4();
        mesh.getMatrixAt(mesh.count - 1, lastMatrix);
        const v = new THREE.Vector3();
        v.applyMatrix4(lastMatrix);
        this.setBlockInstanceId(v.x,v.y,v.z,instanceId);
        mesh.setMatrixAt(instanceId, lastMatrix);
        mesh.count--;

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();

        this.setBlockInstanceId(x,y,z,null);
    }
    removeBlock(x,y,z){
        const block = this.getBlock(x,y,z);
        if(block && block.id !== Blocks.empty.id){
            this.deleteBlockInstance(x,y,z);
            this.setBlockId(x,y,z, Blocks.empty.id);
            this.dataStore.set(this.position.x,this.position.z, x,y,z, Blocks.empty.id);
        }
    }
    // 範囲内か
    isBounds(x,y,z){
        return x >= 0 && x < this.w && y >= 0 && y < this.h && z >= 0 && z < this.d;
    }
    // 周りがブロックでおおわれているブロックか
    isBlockObscured(x,y,z){
        const up = this.getBlock(x, y + 1, z)?.id ?? Blocks.empty.id;
        const down = this.getBlock(x, y - 1, z)?.id ?? Blocks.empty.id;
        const left = this.getBlock(x + 1, y, z)?.id ?? Blocks.empty.id;
        const right = this.getBlock(x - 1, y, z)?.id ?? Blocks.empty.id;
        const forward = this.getBlock(x, y, z + 1)?.id ?? Blocks.empty.id;
        const back = this.getBlock(x, y, z - 1)?.id ?? Blocks.empty.id;

        if(( up === Blocks.empty.id ||
            down === Blocks.empty.id ||
            left === Blocks.empty.id ||
            right === Blocks.empty.id ||
            forward === Blocks.empty.id ||
            back === Blocks.empty.id )){
                return false;
            }
            else{
                return true;
            }
    }
    disposeInstances() {
        this.traverse((obj) => {
          if (obj.dispose) obj.dispose();
        });
        this.clear();
      }
}

export {BlockWorldChunk};